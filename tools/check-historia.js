#!/usr/bin/env node
/* =============================================================================
 *  VERIFICADOR DA HISTORIA   --   npm run check-historia
 * =============================================================================
 *  Roda isso DEPOIS de editar src/historia.js e SEMPRE antes de apresentar.
 *
 *  Ele le a historia inteira e avisa antes da hora sobre as coisas que, se
 *  passarem, so aparecem quando alguem clica no botao errado na frente da
 *  turma:
 *
 *    - carta apontando para uma carta que nao existe (erro de digitacao)
 *    - carta que ninguem nunca alcanca
 *    - caminho que nunca chega ao final
 *    - carta sem saida no meio do jogo
 *    - escolha sem filosofo (nao conta ponto na tendencia)
 *    - variante de texto ainda vazia
 *
 *  Sai com codigo 1 se achar ERRO, para dar para usar em automacao depois.
 * ========================================================================== */

import { cartas, FILOSOFOS, CENA_INICIAL, CENA_FINAL } from '../src/historia.js';

const erros = [];
const avisos = [];
const variantesNaoUsadas = [];

const erro = (m) => erros.push(m);
const aviso = (m) => avisos.push(m);

const ids = Object.keys(cartas);
const idsFilosofos = Object.keys(FILOSOFOS);

/* -----------------------------------------------------------------------------
 *  1. As cartas obrigatorias existem?
 * -------------------------------------------------------------------------- */
if (!cartas[CENA_INICIAL]) {
  erro(`A carta inicial "${CENA_INICIAL}" nao existe em historia.js.`);
}
if (!cartas[CENA_FINAL]) {
  erro(`A carta final "${CENA_FINAL}" nao existe em historia.js.`);
}

/* -----------------------------------------------------------------------------
 *  2. Cada carta, por dentro
 * -------------------------------------------------------------------------- */
for (const id of ids) {
  const carta = cartas[id];
  const onde = `carta "${id}"`;

  if (!carta.fase) aviso(`${onde}: sem "fase" -- o painel vai ficar vazio.`);
  if (!carta.titulo) erro(`${onde}: sem "titulo".`);

  const temCorpo = (carta.texto && carta.texto.trim()) || (carta.pergunta && carta.pergunta.trim());
  if (!temCorpo && id !== CENA_FINAL) {
    aviso(`${onde}: sem "texto" e sem "pergunta" -- a carta aparece vazia na tela.`);
  }

  /* posicao no mapa bem formada? */
  if (carta.mapa) {
    if (!carta.mapa.top || !carta.mapa.left) {
      erro(`${onde}: "mapa" precisa ter "top" e "left" (ex.: { top: '40%', left: '50%' }).`);
    }
  }

  /* escolhas */
  const escolhas = Array.isArray(carta.escolhas) ? carta.escolhas : [];

  if (escolhas.length === 0 && id !== CENA_FINAL) {
    erro(`${onde}: nao tem nenhuma escolha e nao e a carta final -- a sessao trava aqui.`);
  }

  const vistos = new Set();
  for (const escolha of escolhas) {
    const rotulo = `${onde}, escolha "${escolha.id || '(sem id)'}"`;

    if (!escolha.id) erro(`${rotulo}: sem "id".`);
    else if (vistos.has(escolha.id)) erro(`${rotulo}: id repetido dentro da mesma carta.`);
    else vistos.add(escolha.id);

    if (!escolha.titulo) erro(`${rotulo}: sem "titulo" -- o botao fica sem texto.`);

    if (!escolha.destino) {
      erro(`${rotulo}: sem "destino".`);
    } else if (!cartas[escolha.destino]) {
      erro(`${rotulo}: aponta para "${escolha.destino}", que NAO EXISTE em historia.js.`);
    }

    if (escolha.filosofo === undefined) {
      aviso(`${rotulo}: sem o campo "filosofo". Use null se ela nao deve contar ponto.`);
    } else if (escolha.filosofo !== null && !idsFilosofos.includes(escolha.filosofo)) {
      erro(
        `${rotulo}: filosofo "${escolha.filosofo}" desconhecido. Use um destes: ${idsFilosofos.join(', ')}.`
      );
    }
  }

  /* variantes de texto (opcionais) */
  if (carta.variantes && Object.keys(carta.variantes).length > 0) {
    const cheias = [];
    const vazias = [];

    for (const [filosofo, variante] of Object.entries(carta.variantes)) {
      if (!idsFilosofos.includes(filosofo)) {
        erro(`${onde}: variante "${filosofo}" nao e um filosofo conhecido.`);
        continue;
      }
      const preenchida = Object.values(variante || {}).some(
        (v) => typeof v === 'string' && v.trim() !== ''
      );
      (preenchida ? cheias : vazias).push(filosofo);
    }

    if (cheias.length === 0) {
      // ninguem comecou a escrever: e so um recurso opcional nao usado.
      // Vira uma linha de resumo no fim, nao um aviso por filosofo.
      variantesNaoUsadas.push(id);
    } else if (vazias.length > 0) {
      // comecou pela metade: ISSO sim merece aviso, porque parte do grupo
      // veria texto novo e parte veria o texto base.
      aviso(
        `${onde}: variantes pela metade -- escrita para ${cheias.join(', ')}, faltando ${vazias.join(', ')}.`
      );
    }
  }
}

/* -----------------------------------------------------------------------------
 *  3. O grafo: da para chegar em todas as cartas? E do final?
 * -------------------------------------------------------------------------- */
const saidas = (id) => {
  const c = cartas[id];
  if (!c || !Array.isArray(c.escolhas)) return [];
  return c.escolhas.map((e) => e.destino).filter((d) => cartas[d]);
};

/* alcancaveis a partir do inicio */
const alcancaveis = new Set();
(function caminhar(id) {
  if (!id || alcancaveis.has(id) || !cartas[id]) return;
  alcancaveis.add(id);
  for (const proximo of saidas(id)) caminhar(proximo);
})(CENA_INICIAL);

for (const id of ids) {
  if (!alcancaveis.has(id)) {
    aviso(`carta "${id}": ninguem nunca chega nela a partir de "${CENA_INICIAL}".`);
  }
}

/* quem chega ao final (percorrendo o grafo ao contrario) */
const chegamAoFinal = new Set([CENA_FINAL]);
let mudou = true;
while (mudou) {
  mudou = false;
  for (const id of ids) {
    if (chegamAoFinal.has(id)) continue;
    if (saidas(id).some((d) => chegamAoFinal.has(d))) {
      chegamAoFinal.add(id);
      mudou = true;
    }
  }
}

for (const id of alcancaveis) {
  if (!chegamAoFinal.has(id)) {
    erro(`carta "${id}": nenhum caminho a partir dela chega em "${CENA_FINAL}". A sessao trava.`);
  }
}

/* -----------------------------------------------------------------------------
 *  Relatorio
 * -------------------------------------------------------------------------- */
const totalEscolhas = ids.reduce(
  (soma, id) => soma + (Array.isArray(cartas[id].escolhas) ? cartas[id].escolhas.length : 0),
  0
);

const cenas = ids.filter((id) => (cartas[id].tipo || 'cena') === 'cena').length;
const consequencias = ids.filter((id) => cartas[id].tipo === 'consequencia').length;

console.log('');
console.log('  VERIFICADOR DA HISTORIA -- Sombras da Republica');
console.log('  ---------------------------------------------------');
console.log(`  Cartas            : ${ids.length}  (${cenas} de cena, ${consequencias} de consequencia)`);
console.log(`  Escolhas          : ${totalEscolhas}`);
console.log(`  Alcancaveis       : ${alcancaveis.size} de ${ids.length}`);
console.log(`  Chegam ao final   : ${[...alcancaveis].filter((i) => chegamAoFinal.has(i)).length}`);
console.log('  ---------------------------------------------------');

if (variantesNaoUsadas.length) {
  console.log('');
  console.log(`  Variantes por tendencia ainda nao usadas (opcional):`);
  console.log(`    ${variantesNaoUsadas.join(', ')}`);
  console.log('    Essas cartas mostram o texto base para todo mundo.');
}

if (avisos.length) {
  console.log('');
  console.log(`  AVISOS (${avisos.length}) -- o jogo roda, mas de uma olhada:`);
  for (const a of avisos) console.log(`    . ${a}`);
}

if (erros.length) {
  console.log('');
  console.log(`  ERROS (${erros.length}) -- ISSO VAI QUEBRAR NA APRESENTACAO:`);
  for (const e of erros) console.log(`    X ${e}`);
  console.log('');
  process.exit(1);
}

console.log('');
console.log('  Nenhum erro. A historia esta consistente de ponta a ponta.');
console.log('');
