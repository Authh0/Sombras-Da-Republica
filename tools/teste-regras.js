#!/usr/bin/env node
/* =============================================================================
 *  TESTE DAS REGRAS   --   npm run teste-regras
 * =============================================================================
 *  Testa a logica pura: tendencia dominante, desempate, escolha da variante
 *  de texto e apuracao de votos. Nao sobe servidor nem abre navegador --
 *  roda em menos de um segundo.
 *
 *  E o teste que protege a ramificacao: se alguem mexer nas regras e a carta
 *  passar a mostrar a versao do filosofo errado, isso quebra aqui.
 * ========================================================================== */

import {
  cartas,
  montarCarta,
  narracaoDoMestre,
  tendenciaDominante,
  contarFilosofos,
  apurarVotos,
  destinosValidos,
  acharEscolha,
  FASES,
  indiceDaFase,
  CENA_INICIAL,
  CENA_FINAL,
  MINIMO_JOGADORES,
  cartaEDecisao,
  conferirQuorum,
} from '../src/regras.js';

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

const passo = (filosofo) => ({ cartaId: 'x', escolhaId: 'a', filosofo });

console.log('');
console.log('  TESTE DAS REGRAS -- Sombras da Republica');
console.log('  ---------------------------------------------------');

/* ---- tendencia ----------------------------------------------------------- */
console.log('\n  1) Tendencia dominante');
conferir('sessao sem escolhas nao tem tendencia', tendenciaDominante([]) === null);
conferir(
  'escolhas sem filosofo nao contam',
  tendenciaDominante([passo(null), passo(null)]) === null
);
conferir(
  'maioria simples define a tendencia',
  tendenciaDominante([passo('kant'), passo('kant'), passo('maquiavel')]) === 'kant'
);
conferir(
  'empate e desempatado pela escolha mais recente',
  tendenciaDominante([passo('kant'), passo('maquiavel')]) === 'maquiavel'
);
conferir(
  'empate triplo tambem usa o mais recente',
  tendenciaDominante([passo('kant'), passo('maquiavel'), passo('aristoteles')]) === 'aristoteles'
);

const contagem = contarFilosofos([passo('kant'), passo('kant'), passo('maquiavel'), passo(null)]);
conferir(
  'contagem por filosofo esta certa',
  contagem.kant === 2 && contagem.maquiavel === 1 && contagem.aristoteles === 0
);

/* ---- variantes ----------------------------------------------------------- */
console.log('\n  2) Escolha da variante de texto');
const histMaquiavel = [passo('maquiavel'), passo('maquiavel')];

const semVariante = montarCarta('carta3', histMaquiavel);
conferir('sem variante escrita, cai no texto base', semVariante.pergunta === cartas.carta3.pergunta);
conferir('sem variante escrita, nao marca selo', semVariante.varianteUsada === null);

/* preenche so um campo, de proposito */
const guardado = cartas.carta3.variantes.maquiavel.momento;
cartas.carta3.variantes.maquiavel.momento = 'MOMENTO ALTERNATIVO';

const comVariante = montarCarta('carta3', histMaquiavel);
conferir('variante preenchida substitui o campo', comVariante.momento === 'MOMENTO ALTERNATIVO');
conferir('variante parcial ainda marca o selo', comVariante.varianteUsada === 'maquiavel');
conferir(
  'campos vazios da variante caem no base',
  comVariante.pergunta === cartas.carta3.pergunta
);

const outraTendencia = montarCarta('carta3', [passo('kant'), passo('kant')]);
conferir(
  'grupo de outra tendencia nao ve a variante alheia',
  outraTendencia.momento === cartas.carta3.momento
);

cartas.carta3.variantes.maquiavel.momento = guardado; // devolve como estava

/* ---- apuracao ------------------------------------------------------------ */
console.log('\n  3) Apuracao de votos');
const votos = { s1: 'a', s2: 'b', s3: 'b' };
const ap = apurarVotos('carta1', votos);
conferir('total de votos', ap.total === 3);
conferir('contagem por opcao', ap.contagem.a === 1 && ap.contagem.b === 2 && ap.contagem.c === 0);
conferir('vencedor identificado', ap.vencedor === 'b' && ap.empate === false);

const apEmpate = apurarVotos('carta1', { s1: 'a', s2: 'b' });
conferir('empate nao elege vencedor', apEmpate.vencedor === null && apEmpate.empate === true);

const apVazia = apurarVotos('carta1', {});
conferir('sem votos, sem vencedor', apVazia.total === 0 && apVazia.vencedor === null);

const apLixo = apurarVotos('carta1', { s1: 'opcao-que-nao-existe' });
conferir('voto invalido e descartado', apLixo.total === 0);

/* ---- grafo --------------------------------------------------------------- */
console.log('\n  4) Navegacao entre cartas');
conferir('prologo so leva a abertura', destinosValidos('prologo').join() === 'abertura');
conferir('carta final nao tem saida', destinosValidos('final').length === 0);
conferir('escolha existente e encontrada', acharEscolha('carta1', 'a') !== null);
conferir('escolha inexistente devolve null', acharEscolha('carta1', 'z') === null);
conferir('carta inexistente devolve null', montarCarta('carta-fantasma', []) === null);

/* ---- consequencias -------------------------------------------------------- */
console.log('\n  5) Cartas de consequencia');
conferir(
  'cada escolha da carta 1 leva a uma consequencia diferente',
  new Set(destinosValidos('carta1')).size === 3
);
conferir('a consequencia sabe de qual filosofo veio', montarCarta('r1c', []).filosofo === 'maquiavel');
conferir('a consequencia e marcada como consequencia', montarCarta('r1c', []).tipo === 'consequencia');
conferir('a carta de decisao e marcada como cena', montarCarta('carta1', []).tipo === 'cena');
conferir('a consequencia tem uma saida so', destinosValidos('r1c').length === 1);
conferir(
  'as tres consequencias da carta 1 voltam para a mesma carta 2',
  ['r1a', 'r1b', 'r1c'].every((id) => destinosValidos(id)[0] === 'carta2')
);
conferir(
  'as tres consequencias da carta 5 chegam ao final',
  ['r5a', 'r5b', 'r5c'].every((id) => destinosValidos(id)[0] === 'final')
);

/* ---- roteiro do Mestre ---------------------------------------------------- */
console.log('\n  6) Roteiro do Mestre');

const semTags = (t) => t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

conferir(
  'toda carta alcancavel tem roteiro',
  Object.keys(cartas).every((id) => semTags(narracaoDoMestre(id, [])).length > 0)
);
conferir(
  'o roteiro da carta 1 traz o texto e a pergunta',
  semTags(narracaoDoMestre('carta1', [])).includes('Duas pessoas procuraram o jornal na mesma semana') &&
    semTags(narracaoDoMestre('carta1', [])).includes('O espaço nobre do jornal é um só')
);
conferir(
  'a linha de rotulo da consequencia NAO entra no roteiro',
  !semTags(narracaoDoMestre('r1a', [])).includes('O grupo escolheu a prudência')
);
conferir(
  'mas o texto da consequencia entra inteiro',
  semTags(narracaoDoMestre('r1a', [])).includes('As duas histórias saem na mesma página')
);
conferir(
  // A Carta 4 nao tem mais "narracao" propria (a versao antiga tinha): sem
  // override, o roteiro cai na ordem padrao -- momento, depois texto, depois
  // pergunta -- e e essa ordem que este teste garante que continua valendo.
  'sem narracao propria, a Carta 4 segue a ordem padrao: momento, texto, pergunta',
  (() => {
    const t = semTags(narracaoDoMestre('carta4', []));
    const iMomento = t.indexOf('Agora é oficial');
    const iTexto = t.indexOf('Na Câmara Municipal');
    const iPergunta = t.indexOf('Golpe, revolução ou proclamação');
    return iMomento >= 0 && iTexto > iMomento && iPergunta > iTexto;
  })()
);
conferir(
  'a abertura traz a frase inteira de Aristoteles, sem corte',
  semTags(narracaoDoMestre('abertura', [])).includes(
    'mas fazê-lo à pessoa que convém, na medida, na ocasião, pelo motivo e da maneira que convém, eis o que não é para qualquer um'
  )
);
conferir(
  'cada consequencia da Carta 4 carrega seu proprio fecho ate o fim do roteiro',
  semTags(narracaoDoMestre('r4a', [])).includes('Os rótulos ficaram em aberto') &&
    semTags(narracaoDoMestre('r4b', [])).includes('decreto do novo governo vai passar a punir') &&
    semTags(narracaoDoMestre('r4c', [])).includes('A porta ficou aberta')
);
conferir('carta inexistente devolve roteiro vazio', narracaoDoMestre('nao-existe', []) === '');

/* ---- as quatro citacoes reais nao podem mudar ----------------------------
 * Sao as unicas citacoes de verdade no jogo (as tres da abertura e a de
 * Aristides Lobo na carta5). O resto do texto e ficcao/parafrase e pode
 * mudar a vontade -- estas quatro, nao. Se uma delas for editada ou cortada
 * por engano, este bloco quebra. */
console.log('\n  6b) As citacoes reais nao mudam');

const textoAbertura = semTags(cartas.abertura.texto);
conferir(
  'a citacao real de Aristoteles (Etica a Nicomaco) esta intacta',
  textoAbertura.includes(
    'qualquer um pode encolerizar-se, dar ou gastar dinheiro — isso é fácil; mas fazê-lo à pessoa que convém, na medida, na ocasião, pelo motivo e da maneira que convém, eis o que não é para qualquer um'
  ) && textoAbertura.includes('Ética a Nicômaco, Livro II, capítulo 9')
);
conferir(
  'a citacao real de Kant (Fundamentacao da Metafisica dos Costumes) esta intacta',
  textoAbertura.includes(
    'Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne lei universal'
  ) && textoAbertura.includes('Fundamentação da Metafísica dos Costumes')
);
conferir(
  'a citacao real de Maquiavel (O Principe, XV) esta intacta',
  textoAbertura.includes(
    'há tanta diferença de como se vive e como se deveria viver, que aquele que abandone o que se faz por aquilo que se deveria fazer, aprenderá antes o caminho de sua ruína do que o de sua preservação'
  ) && textoAbertura.includes('O Príncipe, capítulo XV')
);

/* ---- trilha das fases ----------------------------------------------------- */
console.log('\n  7) Trilha das fases');
conferir('as fases sao montadas a partir das cartas', FASES.length > 0);
conferir('nao ha fase repetida na trilha', new Set(FASES).size === FASES.length);
conferir(
  'a trilha comeca na fase da carta inicial',
  FASES[0] === cartas[CENA_INICIAL].fase
);
conferir(
  'a trilha termina na fase da carta final',
  FASES[FASES.length - 1] === cartas[CENA_FINAL].fase
);
conferir('a fase da carta 1 vem depois da inicial', indiceDaFase(cartas.carta1.fase) > 0);
conferir('fase desconhecida devolve -1', indiceDaFase('Fase Que Nao Existe') === -1);
conferir(
  'toda carta tem uma fase que esta na trilha',
  Object.keys(cartas).every((id) => indiceDaFase(cartas[id].fase) !== -1)
);
conferir(
  'a consequencia fica na mesma fase da carta que a gerou',
  indiceDaFase(cartas.r1a.fase) === indiceDaFase(cartas.carta1.fase)
);

/* ---- quorum: o jogo nao e single-player ---------------------------------- */
console.log('\n  8) Quorum -- o jogo nao e para um jogador so');

conferir('o minimo de jogadores e pelo menos 2', MINIMO_JOGADORES >= 2);

conferir('carta 1 e carta de decisao', cartaEDecisao('carta1') === true);
conferir('as cinco cartas de decisao sao reconhecidas',
  ['carta1', 'carta2', 'carta3', 'carta4', 'carta5'].every((id) => cartaEDecisao(id)));
conferir('o prologo NAO e carta de decisao', cartaEDecisao('prologo') === false);
conferir('a abertura NAO e carta de decisao', cartaEDecisao('abertura') === false);
conferir('consequencia NAO e carta de decisao', cartaEDecisao('r1a') === false);
conferir('a carta final NAO e carta de decisao', cartaEDecisao(CENA_FINAL) === false);
conferir('carta inexistente NAO e carta de decisao', cartaEDecisao('nao-existe') === false);

// Carta de leitura: nunca trava, senao o Mestre nao coloca nem o prologo na tela.
conferir(
  'carta de leitura avanca sem jogador nenhum',
  conferirQuorum('prologo', { jogadores: 0 }, { total: 0 }).ok === true
);
conferir(
  'carta de leitura nao exige quorum',
  conferirQuorum('prologo', { jogadores: 0 }, { total: 0 }).exigido === false
);
conferir(
  'consequencia avanca sem votos',
  conferirQuorum('r3b', { jogadores: 0 }, { total: 0 }).ok === true
);

// O bug que existia: Mestre sozinho ia do prologo ao final.
const sozinho = conferirQuorum('carta1', { jogadores: 0 }, { total: 0 });
conferir('MESTRE SOZINHO nao avanca uma decisao', sozinho.ok === false);
conferir('o motivo da recusa nao vem vazio', sozinho.motivo.length > 0);
conferir('a recusa aponta falta de jogador', sozinho.faltaJogador === true);
conferir('a recusa aponta falta de voto', sozinho.faltaVoto === true);

conferir(
  'um jogador so nao avanca uma decisao',
  conferirQuorum('carta1', { jogadores: 1 }, { total: 1 }).ok === false
);
conferir(
  'dois conectados mas um voto so nao avanca',
  conferirQuorum('carta1', { jogadores: 2 }, { total: 1 }).ok === false
);
conferir(
  'so a falta de voto e apontada quando ha gente suficiente',
  conferirQuorum('carta1', { jogadores: 2 }, { total: 1 }).faltaJogador === false
);
conferir(
  'um conectado com dois votos nao avanca',
  conferirQuorum('carta1', { jogadores: 1 }, { total: 2 }).ok === false
);
conferir(
  'dois conectados e dois votos avancam',
  conferirQuorum('carta1', { jogadores: 2 }, { total: 2 }).ok === true
);
conferir(
  'turma cheia avanca',
  conferirQuorum('carta5', { jogadores: 12 }, { total: 9 }).ok === true
);
conferir(
  'quando passa o quorum o motivo fica vazio',
  conferirQuorum('carta1', { jogadores: 2 }, { total: 2 }).motivo === ''
);

// Chamada sem argumentos nao pode explodir nem liberar a passagem.
conferir('sem dados de presenca a decisao continua travada', conferirQuorum('carta1').ok === false);
conferir(
  'valores estranhos contam como zero',
  conferirQuorum('carta1', { jogadores: 'muitos' }, { total: null }).ok === false
);

/* ---- relatorio ----------------------------------------------------------- */
console.log('');
console.log('  ---------------------------------------------------');
console.log(`  ${passaram} verificacoes passaram, ${falhas.length} falharam.`);
if (falhas.length) {
  console.log('');
  for (const f of falhas) console.log(`    X ${f}`);
  console.log('');
  process.exit(1);
}
console.log('  Regras do jogo funcionando como esperado.');
console.log('');
