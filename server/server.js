/* =============================================================================
 *  SOMBRAS DA REPUBLICA  --  SERVIDOR
 * =============================================================================
 *  Regra de ouro deste arquivo: O SERVIDOR MANDA.
 *
 *  Na versao anterior o navegador decidia sozinho quem era o Mestre, e o
 *  servidor obedecia qualquer um que mandasse o evento certo. Qualquer aluno
 *  com o console aberto conseguia pular a sessao para o final.
 *
 *  Agora:
 *    - a senha do Mestre e conferida AQUI, nunca no navegador;
 *    - so quem passou pela senha consegue avancar a historia;
 *    - o servidor confere se a carta de destino realmente existe e se e um
 *      destino valido da carta atual (nao da para pular cenas);
 *    - clique duplo do Mestre nao avanca duas vezes (controle de versao).
 * ========================================================================== */

import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import {
  cartas,
  CENA_INICIAL,
  CENA_FINAL,
  montarCarta,
  destinosValidos,
  acharEscolha,
  apurarVotos,
  tendenciaDominante,
  conferirQuorum,
} from '../src/regras.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(__dirname, '..');

/* -----------------------------------------------------------------------------
 *  Leitor de .env caseiro (evita instalar mais uma dependencia)
 * -------------------------------------------------------------------------- */
function carregarEnv() {
  const arquivo = path.join(RAIZ, '.env');
  if (!fs.existsSync(arquivo)) return;
  for (const linha of fs.readFileSync(arquivo, 'utf8').split('\n')) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue;
    const igual = limpa.indexOf('=');
    if (igual === -1) continue;
    const chave = limpa.slice(0, igual).trim();
    const valor = limpa.slice(igual + 1).trim().replace(/^["']|["']$/g, '');
    if (!(chave in process.env)) process.env[chave] = valor;
  }
}
carregarEnv();

const PORTA = Number(process.env.PORT) || 3000;
const SENHA_MESTRE = process.env.SENHA_MESTRE || 'mestre1889';
const SENHA_PADRAO = !process.env.SENHA_MESTRE;

/* -----------------------------------------------------------------------------
 *  HTTP
 * -------------------------------------------------------------------------- */
const app = express();
const http = createServer(app);

app.disable('x-powered-by');

// Só a pasta public fica exposta. Antes a raiz inteira era servida,
// o que deixava package.json e node_modules acessiveis para qualquer um.
app.use(express.static(path.join(RAIZ, 'public'), { dotfiles: 'ignore' }));

// O navegador importa a historia e as regras direto do mesmo arquivo que o
// servidor usa. Uma fonte de verdade, sem etapa de build.
app.use('/src', express.static(path.join(RAIZ, 'src'), { dotfiles: 'ignore' }));

app.get('/saude', (_req, res) => {
  res.json({ ok: true, cena: estado.cena, jogadores: contarPapeis().jogadores });
});

/* -----------------------------------------------------------------------------
 *  Socket.IO
 *  Mantemos o fallback de polling: em wifi de escola e atras de proxy o
 *  WebSocket puro as vezes simplesmente nao conecta.
 * -------------------------------------------------------------------------- */
const io = new Server(http, {
  transports: ['websocket', 'polling'],
  pingTimeout: 20000,
});

/* -----------------------------------------------------------------------------
 *  ESTADO DA SESSAO (a unica verdade do jogo)
 * -------------------------------------------------------------------------- */
const estadoInicial = () => ({
  cena: CENA_INICIAL,
  historico: [], // [{ cartaId, escolhaId, filosofo }]
  votos: {}, // { socketId: escolhaId } -- zerado a cada carta
  versao: 0, // sobe a cada avanco; protege contra clique duplo
  // O corpo do texto da carta comeca ESCONDIDO para a turma: quem narra e o
  // Mestre. Ele revela quando quiser, e a revelacao vale para todo mundo.
  textoRevelado: false,
});

let estado = estadoInicial();

/* Conta apenas quem realmente entrou na sessao. Quem esta parado na tela
   inicial, ou quem voltou para o menu, nao aparece no "na sessao" -- senao o
   numero exibido para a turma contaria gente que nao esta jogando. */
function contarPapeis() {
  let jogadores = 0;
  let mestres = 0;
  for (const s of io.sockets.sockets.values()) {
    if (!s.data.noJogo) continue;
    if (s.data.papel === 'mestre') mestres += 1;
    else jogadores += 1;
  }
  return { jogadores, mestres, total: jogadores + mestres };
}

/* O quorum da carta que esta no ar agora. Usa a mesma funcao de regras.js que
   o navegador usa, entao o motivo mostrado na tela do Mestre e literalmente o
   motivo pelo qual o servidor recusaria o avanco. */
function quorumAtual() {
  return conferirQuorum(estado.cena, contarPapeis(), apurarVotos(estado.cena, estado.votos));
}

function snapshot() {
  return {
    cena: estado.cena,
    historico: estado.historico,
    versao: estado.versao,
    textoRevelado: estado.textoRevelado,
    tendencia: tendenciaDominante(estado.historico),
    apuracao: apurarVotos(estado.cena, estado.votos),
    presenca: contarPapeis(),
  };
}

function transmitirEstado() {
  io.emit('estado', snapshot());
}

function transmitirApuracao() {
  io.emit('apuracao', {
    versao: estado.versao,
    apuracao: apurarVotos(estado.cena, estado.votos),
    presenca: contarPapeis(),
  });
}

/* -----------------------------------------------------------------------------
 *  Conexoes
 * -------------------------------------------------------------------------- */
io.on('connection', (socket) => {
  socket.data.papel = 'jogador';
  socket.data.noJogo = false; // ainda esta na tela inicial
  socket.data.tentativasSenha = 0;
  socket.data.ultimoVoto = 0;

  socket.emit('bem-vindo', { papel: 'jogador', estado: snapshot() });
  transmitirEstado();

  /* ---- virar Mestre: a senha e conferida AQUI, no servidor --------------- */
  socket.on('autenticar_mestre', (dados, resposta) => {
    const responder = typeof resposta === 'function' ? resposta : () => {};

    socket.data.tentativasSenha += 1;
    if (socket.data.tentativasSenha > 6) {
      return responder({ ok: false, erro: 'Tentativas demais. Recarregue a página.' });
    }

    const senha = dados && typeof dados.senha === 'string' ? dados.senha : '';
    if (senha !== SENHA_MESTRE) {
      return responder({ ok: false, erro: 'Senha incorreta.' });
    }

    socket.data.papel = 'mestre';
    socket.data.noJogo = true;
    socket.data.tentativasSenha = 0; // acertou: zera o contador de tentativas
    responder({ ok: true, papel: 'mestre', estado: snapshot() });
    transmitirEstado();
  });

  socket.on('entrar_como_jogador', (_dados, resposta) => {
    socket.data.papel = 'jogador';
    socket.data.noJogo = true;
    if (typeof resposta === 'function') resposta({ ok: true, papel: 'jogador', estado: snapshot() });
    transmitirEstado();
  });

  /* ---- sair da sessao e voltar ao menu ------------------------------------
   * O papel volta a ser jogador AQUI, no servidor. Se so o navegador
   * "esquecesse" que era Mestre, a conexao continuaria autorizada e quem
   * saiu ainda conseguiria avancar a historia pelo console.
   * A sessao da turma nao e tocada: cena e historico continuam como estavam.
   * -------------------------------------------------------------------- */
  socket.on('sair', (_dados, resposta) => {
    socket.data.papel = 'jogador';
    socket.data.noJogo = false;
    delete estado.votos[socket.id]; // quem foi para o menu nao vota
    if (typeof resposta === 'function') resposta({ ok: true });
    transmitirEstado();
  });

  /* ---- voto de jogador --------------------------------------------------- */
  socket.on('votar', (dados) => {
    // trava simples contra spam de voto
    const agora = Date.now();
    if (agora - socket.data.ultimoVoto < 250) return;
    socket.data.ultimoVoto = agora;

    const escolhaId = dados && typeof dados.escolhaId === 'string' ? dados.escolhaId : null;
    if (!escolhaId) return;

    // o voto so vale para a carta que esta no ar agora
    if (!acharEscolha(estado.cena, escolhaId)) return;

    estado.votos[socket.id] = escolhaId;
    transmitirApuracao();
  });

  /* ---- Mestre avanca a historia ------------------------------------------ */
  socket.on('mestre_avancar', (dados, resposta) => {
    const responder = typeof resposta === 'function' ? resposta : () => {};
    if (socket.data.papel !== 'mestre') {
      return responder({ ok: false, erro: 'Apenas o Mestre pode avançar a sessão.' });
    }

    // Clique duplo: o segundo clique chega com a versao antiga e e ignorado.
    if (dados && typeof dados.versao === 'number' && dados.versao !== estado.versao) {
      return responder({ ok: false, erro: 'Essa decisão já foi registrada.' });
    }

    const escolhaId = dados && typeof dados.escolhaId === 'string' ? dados.escolhaId : null;
    const escolha = acharEscolha(estado.cena, escolhaId);
    if (!escolha) {
      return responder({ ok: false, erro: 'Essa escolha não existe nesta carta.' });
    }

    // Ninguem pula cenas: o destino tem que existir e ser um destino
    // declarado da carta atual.
    if (!cartas[escolha.destino] || !destinosValidos(estado.cena).includes(escolha.destino)) {
      return responder({ ok: false, erro: 'Destino inválido.' });
    }

    /* ---- QUORUM: este jogo nao e single-player --------------------------
     * Numa carta de decisao a turma precisa estar junto: no minimo
     * MINIMO_JOGADORES conectados E o mesmo numero de votos dados.
     *
     * A liberacao manual ("forcar") existe para a apresentacao ao vivo: se o
     * wifi da escola derrubar meia turma no meio da sessao, o Mestre nao pode
     * ficar preso na frente da sala. Ela e so do Mestre (o papel ja foi
     * conferido acima) e fica registrada no log do servidor.
     * ------------------------------------------------------------------ */
    const quorum = quorumAtual();
    const forcar = dados && dados.forcar === true;

    if (!quorum.ok && !forcar) {
      return responder({ ok: false, erro: quorum.motivo, quorum });
    }
    if (!quorum.ok && forcar) {
      console.log(
        `  [quorum] liberacao manual do Mestre em "${estado.cena}" ` +
          `(jogadores=${quorum.jogadores}, votos=${quorum.votos}, minimo=${quorum.minimo}).`
      );
    }

    estado.historico.push({
      cartaId: estado.cena,
      escolhaId: escolha.id,
      filosofo: escolha.filosofo || null,
    });
    estado.cena = escolha.destino;
    estado.votos = {};
    estado.textoRevelado = false; // carta nova comeca escondida de novo
    estado.versao += 1;

    responder({ ok: true });
    transmitirEstado();
  });

  /* ---- Mestre volta uma carta (salva-vidas de apresentacao) --------------- */
  socket.on('mestre_voltar', (_dados, resposta) => {
    const responder = typeof resposta === 'function' ? resposta : () => {};
    if (socket.data.papel !== 'mestre') {
      return responder({ ok: false, erro: 'Apenas o Mestre pode voltar.' });
    }
    if (estado.historico.length === 0) {
      return responder({ ok: false, erro: 'A sessão já está no começo.' });
    }

    const ultimo = estado.historico.pop();
    estado.cena = ultimo.cartaId;
    estado.votos = {};
    estado.textoRevelado = false;
    estado.versao += 1;

    responder({ ok: true });
    transmitirEstado();
  });

  /* ---- Mestre revela o texto na tela da turma ------------------------------
   * Por padrao a turma ve so a abertura da cena e a pergunta -- o corpo do
   * texto e narrado pelo Mestre. Este evento mostra (ou esconde de novo) o
   * texto completo na tela de todo mundo, por exemplo depois de narrar, para
   * quem quiser reler antes de votar.
   * -------------------------------------------------------------------- */
  socket.on('mestre_revelar', (dados, resposta) => {
    const responder = typeof resposta === 'function' ? resposta : () => {};
    if (socket.data.papel !== 'mestre') {
      return responder({ ok: false, erro: 'Apenas o Mestre pode revelar o texto.' });
    }

    estado.textoRevelado =
      dados && typeof dados.revelar === 'boolean' ? dados.revelar : !estado.textoRevelado;

    responder({ ok: true, textoRevelado: estado.textoRevelado });
    transmitirEstado();
  });

  /* ---- Mestre salta para qualquer carta ------------------------------------
   * Salva-vidas de apresentacao: se o tempo apertar, ele corta caminho.
   * Diferente do avancar normal, este nao exige que a carta seja um destino
   * valido da carta atual -- mas continua exigindo ser o Mestre e que a carta
   * exista de verdade. O historico NAO e inventado: o caminho filosofico
   * mostrado no final continua sendo so o que a turma realmente escolheu.
   * -------------------------------------------------------------------- */
  socket.on('mestre_ir_para', (dados, resposta) => {
    const responder = typeof resposta === 'function' ? resposta : () => {};
    if (socket.data.papel !== 'mestre') {
      return responder({ ok: false, erro: 'Apenas o Mestre pode saltar de carta.' });
    }

    const cartaId = dados && typeof dados.cartaId === 'string' ? dados.cartaId : null;
    if (!cartaId || !cartas[cartaId]) {
      return responder({ ok: false, erro: 'Essa carta não existe.' });
    }

    estado.cena = cartaId;
    estado.votos = {};
    estado.textoRevelado = false;
    estado.versao += 1;

    responder({ ok: true });
    transmitirEstado();
  });

  /* ---- Mestre reinicia ---------------------------------------------------- */
  socket.on('mestre_reiniciar', (_dados, resposta) => {
    const responder = typeof resposta === 'function' ? resposta : () => {};
    if (socket.data.papel !== 'mestre') {
      return responder({ ok: false, erro: 'Apenas o Mestre pode reiniciar.' });
    }
    const versao = estado.versao + 1;
    estado = estadoInicial();
    estado.versao = versao;
    responder({ ok: true });
    transmitirEstado();
  });

  socket.on('disconnect', () => {
    delete estado.votos[socket.id];
    transmitirEstado();
  });
});

/* -----------------------------------------------------------------------------
 *  Sobe o servidor
 * -------------------------------------------------------------------------- */
function ipsDaRede() {
  const lista = [];
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const i of interfaces || []) {
      if (i.family === 'IPv4' && !i.internal) lista.push(i.address);
    }
  }
  return lista;
}

http.listen(PORTA, '0.0.0.0', () => {
  const cartasTotal = Object.keys(cartas).length;
  console.log('');
  console.log('  SOMBRAS DA REPUBLICA -- servidor no ar');
  console.log('  ---------------------------------------------------');
  console.log(`  Cartas carregadas : ${cartasTotal}  (inicio: ${CENA_INICIAL}, final: ${CENA_FINAL})`);
  console.log(`  Neste computador  : http://localhost:${PORTA}`);
  for (const ip of ipsDaRede()) {
    console.log(`  Para os celulares : http://${ip}:${PORTA}`);
  }
  console.log('  ---------------------------------------------------');
  if (SENHA_PADRAO) {
    console.log('  ATENCAO: usando a senha padrao do Mestre ("mestre1889").');
    console.log('  Crie um arquivo .env com SENHA_MESTRE=suasenha antes de apresentar.');
  } else {
    console.log('  Senha do Mestre personalizada carregada.');
  }
  console.log('');
});
