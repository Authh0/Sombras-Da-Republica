#!/usr/bin/env node
/* =============================================================================
 *  TESTE DE SESSAO   --   npm run teste
 * =============================================================================
 *  Sobe o servidor de verdade numa porta separada, conecta um Mestre e dois
 *  jogadores como se fossem tres celulares, e joga uma sessao inteira do
 *  comeco ao fim conferindo tudo.
 *
 *  O teste mais importante daqui e o numero 3: ele repete exatamente o ataque
 *  que funcionava na versao antiga (um jogador comum mandando o evento do
 *  Mestre) e exige que agora seja RECUSADO.
 * ========================================================================== */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { io as conectar } from 'socket.io-client';

import { cartaEDecisao, MINIMO_JOGADORES } from '../src/regras.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(__dirname, '..');

const PORTA = 3999;
const SENHA = 'senha-de-teste';
const URL = `http://localhost:${PORTA}`;

let passaram = 0;
const falhas = [];

function conferir(descricao, condicao) {
  if (condicao) {
    passaram += 1;
    console.log(`    ok  ${descricao}`);
  } else {
    falhas.push(descricao);
    console.log(`    XX  ${descricao}`);
  }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* Promessa que resolve com a resposta do servidor (callback do socket.io) */
function pedir(socket, evento, dados) {
  return new Promise((resolve) => {
    let respondido = false;
    socket.emit(evento, dados, (r) => {
      respondido = true;
      resolve(r);
    });
    setTimeout(() => {
      if (!respondido) resolve({ ok: false, erro: 'sem resposta (timeout)' });
    }, 2500);
  });
}

function novoCliente() {
  const socket = conectar(URL, { transports: ['websocket'], forceNew: true });
  socket.ultimoEstado = null;
  socket.on('estado', (e) => {
    socket.ultimoEstado = e;
  });
  socket.on('apuracao', (d) => {
    if (socket.ultimoEstado) socket.ultimoEstado.apuracao = d.apuracao;
  });
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });
}

/* Faz a turma votar. Depois da regra de quorum, uma carta de decisao so
   avanca com MINIMO_JOGADORES conectados E o mesmo numero de votos -- entao
   o teste tem que votar antes de avancar, igual a turma de verdade. */
async function votarTodos(jogadores, escolhaId) {
  for (const j of jogadores) j.emit('votar', { escolhaId });
  await esperar(300);
}

/* -------------------------------------------------------------------------- */
async function principal() {
  console.log('');
  console.log('  TESTE DE SESSAO -- Sombras da Republica');
  console.log('  ---------------------------------------------------');

  const servidor = spawn('node', [path.join(RAIZ, 'server', 'server.js')], {
    env: { ...process.env, PORT: String(PORTA), SENHA_MESTRE: SENHA },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  servidor.stderr.on('data', (d) => console.error('  [servidor]', String(d).trim()));

  const encerrar = (codigo) => {
    servidor.kill('SIGTERM');
    process.exit(codigo);
  };

  await esperar(1200);

  let mestre, jogador1, jogador2;
  try {
    mestre = await novoCliente();
    jogador1 = await novoCliente();
    jogador2 = await novoCliente();
  } catch (e) {
    console.error('  Nao consegui conectar no servidor de teste:', e.message);
    return encerrar(1);
  }

  /* ---- 1. senha errada --------------------------------------------------- */
  console.log('\n  1) Autenticacao do Mestre');
  const senhaErrada = await pedir(mestre, 'autenticar_mestre', { senha: '123' });
  conferir('senha errada e recusada', senhaErrada && senhaErrada.ok === false);

  const senhaCerta = await pedir(mestre, 'autenticar_mestre', { senha: SENHA });
  conferir('senha certa e aceita', senhaCerta && senhaCerta.ok === true);

  /* ---- 2. estado inicial ------------------------------------------------- */
  console.log('\n  2) Estado inicial');
  await esperar(200);
  conferir(
    'quem ainda nao entrou nao conta na sessao',
    jogador1.ultimoEstado?.presenca?.total === 1
  );

  await pedir(jogador1, 'entrar_como_jogador', {});
  await pedir(jogador2, 'entrar_como_jogador', {});
  await esperar(200);

  conferir('sessao comeca no prologo', jogador1.ultimoEstado?.cena === 'prologo');
  conferir('historico comeca vazio', jogador1.ultimoEstado?.historico.length === 0);
  conferir('tres na sessao depois de todos entrarem', jogador1.ultimoEstado?.presenca?.total === 3);

  /* ---- 3. O ATAQUE que funcionava antes ---------------------------------- */
  console.log('\n  3) Jogador comum tentando controlar a sessao');
  const ataque1 = await pedir(jogador1, 'mestre_avancar', { escolhaId: 'a' });
  conferir('jogador NAO consegue avancar a historia', ataque1 && ataque1.ok === false);

  const ataque2 = await pedir(jogador2, 'mestre_reiniciar', {});
  conferir('jogador NAO consegue reiniciar a sessao', ataque2 && ataque2.ok === false);

  const ataque3 = await pedir(jogador1, 'mestre_voltar', {});
  conferir('jogador NAO consegue voltar cartas', ataque3 && ataque3.ok === false);

  await esperar(200);
  conferir('depois dos ataques a sessao continua no prologo', jogador1.ultimoEstado?.cena === 'prologo');

  /* ---- 4. pulo de cena --------------------------------------------------- */
  console.log('\n  4) Mestre tentando pular cenas');
  const pulo = await pedir(mestre, 'mestre_avancar', { escolhaId: 'c' }); // nao existe no prologo
  conferir('escolha inexistente na carta atual e recusada', pulo && pulo.ok === false);

  /* ---- 5. avanco legitimo ------------------------------------------------ */
  console.log('\n  5) Mestre avancando de verdade');
  const avanco = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  conferir('Mestre avanca do prologo para a abertura', avanco && avanco.ok === true);
  await esperar(200);
  conferir('todos os clientes foram para a abertura', jogador2.ultimoEstado?.cena === 'abertura');

  /* ---- 6. clique duplo --------------------------------------------------- */
  console.log('\n  6) Clique duplo do Mestre');
  const versaoAtual = mestre.ultimoEstado.versao;
  const primeiro = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a', versao: versaoAtual });
  const segundo = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a', versao: versaoAtual });
  conferir('primeiro clique funciona', primeiro && primeiro.ok === true);
  conferir('segundo clique (versao velha) e ignorado', segundo && segundo.ok === false);
  await esperar(200);
  conferir('avancou uma carta so, nao duas', mestre.ultimoEstado?.cena === 'carta1');
  conferir('historico registrou 2 passos, nao 3', mestre.ultimoEstado?.historico.length === 2);

  /* ---- 7. votacao -------------------------------------------------------- */
  console.log('\n  7) Votacao dos jogadores');
  jogador1.emit('votar', { escolhaId: 'b' });
  jogador2.emit('votar', { escolhaId: 'b' });
  await esperar(350);
  conferir(
    'dois votos em B sao contados',
    mestre.ultimoEstado?.apuracao?.contagem?.b === 2 && mestre.ultimoEstado?.apuracao?.total === 2
  );
  conferir('B aparece como vencedor', mestre.ultimoEstado?.apuracao?.vencedor === 'b');

  jogador2.emit('votar', { escolhaId: 'c' });
  await esperar(350);
  conferir('jogador pode trocar o voto', mestre.ultimoEstado?.apuracao?.contagem?.b === 1);
  conferir('empate e detectado', mestre.ultimoEstado?.apuracao?.empate === true);

  jogador1.emit('votar', { escolhaId: 'zzz' }); // escolha inexistente
  await esperar(300);
  conferir('voto em opcao inexistente e ignorado', mestre.ultimoEstado?.apuracao?.total === 2);

  /* ---- 8. a carta de consequencia ---------------------------------------- */
  console.log('\n  8) Consequencia da escolha');
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'c' }); // carta1 opcao C
  await esperar(250);
  conferir('a escolha C leva para a consequencia r1c', mestre.ultimoEstado?.cena === 'r1c');
  conferir('votos zeram ao virar a carta', mestre.ultimoEstado?.apuracao?.total === 0);
  conferir(
    'a tendencia ja reflete a escolha',
    mestre.ultimoEstado?.tendencia === 'maquiavel'
  );
  conferir('a consequencia tem uma saida so', mestre.ultimoEstado?.apuracao?.contagem?.b === undefined);

  /* ---- 9. tendencia dominante ------------------------------------------- */
  console.log('\n  9) Tendencia e ramificacao');
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' }); // r1c -> carta2
  await esperar(200);
  conferir('a consequencia leva para a carta 2', mestre.ultimoEstado?.cena === 'carta2');

  await votarTodos([jogador1, jogador2], 'b');
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'b' }); // carta2 -> Kant -> r2b
  await esperar(250);
  conferir('escolha B leva para a consequencia r2b', mestre.ultimoEstado?.cena === 'r2b');
  conferir(
    'empate de tendencia usa a escolha mais recente',
    mestre.ultimoEstado?.tendencia === 'kant'
  );

  /* ---- 10. voltar uma carta --------------------------------------------- */
  console.log('\n  10) Salva-vidas do Mestre');
  const antesDeVoltar = mestre.ultimoEstado.cena;
  const voltou = await pedir(mestre, 'mestre_voltar', {});
  await esperar(250);
  conferir('Mestre consegue voltar uma carta', voltou && voltou.ok === true);
  conferir('a cena realmente mudou ao voltar', mestre.ultimoEstado?.cena !== antesDeVoltar);

  /* ---- 11. sessao completa ate o final ----------------------------------- */
  console.log('\n  11) Sessao completa ate o final');
  await pedir(mestre, 'mestre_reiniciar', {});
  await esperar(250);
  conferir('reiniciar volta para o prologo', mestre.ultimoEstado?.cena === 'prologo');
  conferir('reiniciar limpa o historico', mestre.ultimoEstado?.historico.length === 0);

  // prologo -> abertura -> carta1 -> r1b -> carta2 -> r2b -> ... -> final
  // As cartas de decisao votam 'b' (Kant); as consequencias so tem 'a'.
  const roteiro = ['a', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'a', 'b', 'a'];
  const visitadas = [];
  for (const escolhaId of roteiro) {
    // Nas cartas de decisao a turma vota primeiro -- sem isso o servidor
    // recusa o avanco, e e exatamente essa recusa que queremos ter.
    if (cartaEDecisao(mestre.ultimoEstado?.cena)) {
      await votarTodos([jogador1, jogador2], escolhaId);
    }
    const r = await pedir(mestre, 'mestre_avancar', { escolhaId });
    if (!r || !r.ok) break;
    await esperar(120);
    visitadas.push(mestre.ultimoEstado?.cena);
  }
  await esperar(250);
  conferir('a sessao chega na carta final', mestre.ultimoEstado?.cena === 'final');
  conferir('o historico tem os 12 passos', mestre.ultimoEstado?.historico.length === 12);
  conferir('tendencia final e Kant', mestre.ultimoEstado?.tendencia === 'kant');
  conferir(
    'passou pelas 5 consequencias de Kant',
    ['r1b', 'r2b', 'r3b', 'r4b', 'r5b'].every((c) => visitadas.includes(c))
  );

  /* ---- 12. sair para o menu ---------------------------------------------- */
  console.log('\n  12) Sair para o menu principal');
  const cenaAntesDeSair = mestre.ultimoEstado.cena;
  const passosAntesDeSair = mestre.ultimoEstado.historico.length;

  await pedir(mestre, 'sair', {});
  await esperar(250);

  conferir('a sessao da turma continua na mesma carta', jogador1.ultimoEstado?.cena === cenaAntesDeSair);
  conferir(
    'o historico nao e apagado por alguem sair',
    jogador1.ultimoEstado?.historico.length === passosAntesDeSair
  );
  conferir('quem saiu deixa de contar na sessao', jogador1.ultimoEstado?.presenca?.total === 2);

  // o teste que importa: sair precisa TIRAR o poder de Mestre no servidor
  const depoisDeSair = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  conferir(
    'quem saiu NAO comanda mais a sessao',
    depoisDeSair && depoisDeSair.ok === false
  );

  const reiniciarDepoisDeSair = await pedir(mestre, 'mestre_reiniciar', {});
  conferir(
    'quem saiu NAO consegue reiniciar',
    reiniciarDepoisDeSair && reiniciarDepoisDeSair.ok === false
  );

  // e precisa dar para voltar, digitando a senha de novo
  const reentrou = await pedir(mestre, 'autenticar_mestre', { senha: SENHA });
  await esperar(200);
  conferir('da para voltar como Mestre com a senha', reentrou && reentrou.ok === true);
  conferir('volta a contar na sessao', jogador1.ultimoEstado?.presenca?.total === 3);

  const voltouAoPoder = await pedir(mestre, 'mestre_voltar', {});
  conferir('e os comandos de Mestre voltam a funcionar', voltouAoPoder && voltouAoPoder.ok === true);

  /* ---- 13. jogador que sai deixa de votar --------------------------------- */
  console.log('\n  13) Voto de quem saiu');
  await pedir(mestre, 'mestre_reiniciar', {});
  await esperar(200);
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' }); // abertura
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' }); // carta1
  await esperar(250);

  jogador1.emit('votar', { escolhaId: 'a' });
  jogador2.emit('votar', { escolhaId: 'a' });
  await esperar(400);
  conferir('dois votos contados', mestre.ultimoEstado?.apuracao?.total === 2);

  await pedir(jogador2, 'sair', {});
  await esperar(300);
  conferir('o voto de quem saiu e descartado', mestre.ultimoEstado?.apuracao?.total === 1);

  await pedir(jogador2, 'entrar_como_jogador', {});
  await esperar(200);

  /* ---- 14. revelar o texto ------------------------------------------------ */
  console.log('\n  14) Revelar o texto na tela');
  await esperar(200);
  conferir('carta comeca com o texto escondido', jogador1.ultimoEstado?.textoRevelado === false);

  const revelarProibido = await pedir(jogador1, 'mestre_revelar', {});
  conferir('jogador NAO pode revelar o texto', revelarProibido && revelarProibido.ok === false);

  const revelou = await pedir(mestre, 'mestre_revelar', {});
  await esperar(250);
  conferir('Mestre revela o texto', revelou && revelou.ok === true);
  conferir('todos os clientes recebem a revelacao', jogador1.ultimoEstado?.textoRevelado === true);

  await pedir(mestre, 'mestre_revelar', {});
  await esperar(250);
  conferir('e consegue esconder de novo', jogador1.ultimoEstado?.textoRevelado === false);

  await pedir(mestre, 'mestre_revelar', { revelar: true });
  await esperar(200);
  await votarTodos([jogador1, jogador2], 'a'); // carta1 e decisao: precisa de votos
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  await esperar(250);
  conferir(
    'a carta seguinte volta a comecar escondida',
    jogador1.ultimoEstado?.textoRevelado === false
  );

  /* ---- 15. saltar de carta ------------------------------------------------ */
  console.log('\n  15) Saltar para outra carta');
  const saltoProibido = await pedir(jogador1, 'mestre_ir_para', { cartaId: 'final' });
  conferir('jogador NAO pode saltar de carta', saltoProibido && saltoProibido.ok === false);

  const saltoInvalido = await pedir(mestre, 'mestre_ir_para', { cartaId: 'carta-que-nao-existe' });
  conferir('carta inexistente e recusada', saltoInvalido && saltoInvalido.ok === false);

  const passosAntesDoSalto = mestre.ultimoEstado.historico.length;
  const salto = await pedir(mestre, 'mestre_ir_para', { cartaId: 'carta5' });
  await esperar(250);
  conferir('Mestre salta para a carta 5', salto && salto.ok === true);
  conferir('todos os clientes saltaram junto', jogador1.ultimoEstado?.cena === 'carta5');
  conferir(
    'o salto NAO inventa escolhas no caminho filosofico',
    mestre.ultimoEstado?.historico.length === passosAntesDoSalto
  );

  /* ---- 16. QUORUM: o jogo nao e single-player -----------------------------
   * O bug que este bloco existe para impedir: o Mestre ia do prologo ao
   * final com ZERO jogadores conectados e ZERO votos. Era, na pratica, um
   * jogo de um jogador -- exatamente o que o trabalho nao pode ser.
   * -------------------------------------------------------------------- */
  console.log('\n  16) Quorum -- nao da para jogar sozinho');

  await pedir(mestre, 'mestre_reiniciar', {});
  await esperar(250);

  // As cartas de leitura continuam livres: sem isso o Mestre nao conseguiria
  // nem colocar o prologo na tela enquanto a turma ainda esta entrando.
  const leitura1 = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  const leitura2 = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  await esperar(250);
  conferir('carta de leitura avanca sem votos', leitura1?.ok === true && leitura2?.ok === true);
  conferir('a sessao chegou na carta 1', mestre.ultimoEstado?.cena === 'carta1');

  // Dois jogadores conectados, nenhum voto: a decisao trava.
  const semVoto = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  conferir('decisao SEM voto nenhum e recusada', semVoto?.ok === false);
  conferir('a recusa explica o motivo', typeof semVoto?.erro === 'string' && semVoto.erro.length > 0);
  await esperar(200);
  conferir('a sessao nao saiu da carta 1', mestre.ultimoEstado?.cena === 'carta1');

  // Um voto so tambem nao basta.
  await votarTodos([jogador1], 'a');
  const umVoto = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  conferir(`decisao com 1 voto e recusada (minimo ${MINIMO_JOGADORES})`, umVoto?.ok === false);

  // Com a turma junta, passa.
  await votarTodos([jogador2], 'a');
  const doisVotos = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  await esperar(250);
  conferir('decisao com 2 jogadores e 2 votos e aceita', doisVotos?.ok === true);
  conferir('a sessao avancou para a consequencia', mestre.ultimoEstado?.cena === 'r1a');

  /* ---- 17. Mestre realmente sozinho --------------------------------------- */
  console.log('\n  17) Mestre sozinho na sessao');

  await pedir(jogador1, 'sair', {});
  await pedir(jogador2, 'sair', {});
  await esperar(300);
  conferir('nao ha mais jogador nenhum na sessao', mestre.ultimoEstado?.presenca?.jogadores === 0);

  await pedir(mestre, 'mestre_reiniciar', {});
  await esperar(200);
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' }); // prologo -> abertura
  await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' }); // abertura -> carta1
  await esperar(250);
  conferir('sozinho ele ainda le o prologo e a abertura', mestre.ultimoEstado?.cena === 'carta1');

  const sozinho = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a' });
  conferir('MESTRE SOZINHO nao passa da primeira decisao', sozinho?.ok === false);
  await esperar(200);
  conferir('a sessao continua travada na carta 1', mestre.ultimoEstado?.cena === 'carta1');

  // O salva-vidas da apresentacao: liberacao manual, so do Mestre.
  const liberou = await pedir(mestre, 'mestre_avancar', { escolhaId: 'a', forcar: true });
  await esperar(250);
  conferir('a liberacao manual do Mestre funciona', liberou?.ok === true);
  conferir('e a sessao avanca mesmo assim', mestre.ultimoEstado?.cena === 'r1a');

  // E o buraco obvio: jogador comum nao pode usar a liberacao para comandar.
  await pedir(jogador1, 'entrar_como_jogador', {});
  await pedir(jogador2, 'entrar_como_jogador', {});
  await esperar(250);
  const forcarProibido = await pedir(jogador1, 'mestre_avancar', { escolhaId: 'a', forcar: true });
  conferir('jogador NAO avanca nem usando a liberacao', forcarProibido?.ok === false);

  /* ---- 18. desconexao ---------------------------------------------------- */
  console.log('\n  18) Alguem fecha o celular');
  jogador2.close();
  await esperar(400);
  conferir('a contagem de presentes cai para 2', mestre.ultimoEstado?.presenca?.total === 2);

  /* ---- relatorio --------------------------------------------------------- */
  mestre.close();
  jogador1.close();
  await esperar(200);

  console.log('');
  console.log('  ---------------------------------------------------');
  console.log(`  ${passaram} verificacoes passaram, ${falhas.length} falharam.`);
  if (falhas.length) {
    console.log('');
    for (const f of falhas) console.log(`    X ${f}`);
    console.log('');
    return encerrar(1);
  }
  console.log('  Sessao inteira funcionando de ponta a ponta.');
  console.log('');
  encerrar(0);
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
