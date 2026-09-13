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
  tendenciaDominante,
  contarFilosofos,
  apurarVotos,
  destinosValidos,
  acharEscolha,
  FASES,
  indiceDaFase,
  CENA_INICIAL,
  CENA_FINAL,
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

/* ---- trilha das fases ----------------------------------------------------- */
console.log('\n  6) Trilha das fases');
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
