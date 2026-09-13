#!/usr/bin/env node
/* =============================================================================
 *  GERADOR DO ROTEIRO DO MESTRE   --   npm run roteiro
 * =============================================================================
 *  Escreve o documento que o Mestre le em voz alta, montado A PARTIR de
 *  src/historia.js.
 *
 *  Por que gerar em vez de manter um arquivo a parte: enquanto o roteiro era
 *  um documento solto, ele foi saindo de sincronia com o jogo sem ninguem
 *  perceber -- uma frase cortada aqui, uma ordem trocada ali, uma carta sem
 *  texto nenhum. Gerando, isso nao acontece mais: editem a historia, rodem
 *  este comando, e o roteiro sai igualzinho ao que a turma ve na tela.
 *
 *  Saida: roteiro-do-mestre.txt na raiz do projeto.
 * ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cartas, FILOSOFOS, narracaoDoMestre } from '../src/regras.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAIDA = path.join(__dirname, '..', 'roteiro-do-mestre.txt');

/* HTML simples -> texto corrido, com as quebras de paragrafo preservadas */
function paraTexto(html) {
  return String(html || '')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n /g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* Quebra o paragrafo em linhas de ate 78 colunas, para ler no papel sem
   perder a linha no meio da frase. */
function dobrar(texto, largura = 78) {
  return texto
    .split('\n')
    .map((paragrafo) => {
      if (!paragrafo) return '';
      const linhas = [];
      let atual = '';
      for (const palavra of paragrafo.split(' ')) {
        if ((atual + ' ' + palavra).trim().length > largura) {
          linhas.push(atual.trim());
          atual = palavra;
        } else {
          atual += ' ' + palavra;
        }
      }
      if (atual.trim()) linhas.push(atual.trim());
      return linhas.join('\n');
    })
    .join('\n');
}

const L = [];
const linha = (t = '') => L.push(t);
const regua = (c = '=') => linha(c.repeat(78));

/* ---------------------------------------------------------------- cabecalho */
linha('SOMBRAS DA REPUBLICA — A Trindade Filosofica');
linha('ROTEIRO DO MESTRE');
regua();
linha();
linha(dobrar(
  'Este documento foi gerado a partir do arquivo da historia do jogo, entao ' +
  'o que esta escrito aqui e exatamente o que a turma esta vendo na tela. ' +
  'Se voces editarem a historia, rodem "npm run roteiro" de novo e este ' +
  'arquivo se atualiza sozinho.'
));
linha();
linha('COMO USAR NA APRESENTACAO');
linha();
linha(dobrar(
  '1. Leia em voz alta o bloco LEIA da carta que esta na tela.\n' +
  '2. Nas cartas de decisao, a turma vota no celular. Espere a votacao.\n' +
  '3. Olhe o resultado no painel e toque na opcao escolhida.\n' +
  '4. Confirme. A tela vira para a consequencia daquela escolha.\n' +
  '5. Leia a consequencia. Siga.'
));
linha();
linha(dobrar(
  'O mesmo texto tambem aparece dentro do site, numa area dourada que so o ' +
  'Mestre enxerga, no alto da tela. Este arquivo serve para imprimir ou para ' +
  'usar num segundo aparelho.'
));
linha();

/* ------------------------------------------------------------------ indice */
regua('-');
linha('INDICE');
regua('-');
linha();
let n = 0;
for (const [id, carta] of Object.entries(cartas)) {
  n += 1;
  const tipo = carta.tipo === 'consequencia' ? 'consequencia' : 'cena';
  linha(`  ${String(n).padStart(2, ' ')}. [${tipo}] ${carta.titulo}`);
}
linha();

/* ------------------------------------------------------------------- corpo */
n = 0;
for (const [id, carta] of Object.entries(cartas)) {
  n += 1;
  const ehConsequencia = carta.tipo === 'consequencia';
  const filosofo = carta.filosofo && FILOSOFOS[carta.filosofo];

  linha();
  regua();
  linha(`${String(n).padStart(2, ' ')}.  ${carta.titulo.toUpperCase()}`);
  if (filosofo) linha(`     caminho de ${filosofo.nomeExibicao.toUpperCase()}`);
  linha(`     fase: ${carta.fase}`);
  regua();
  linha();

  if (ehConsequencia) {
    linha(`     >> Leia isto SOMENTE se a turma escolheu a opcao ${id.slice(-1).toUpperCase()}.`);
    linha();
  }

  linha('     ---------- LEIA EM VOZ ALTA ----------');
  linha();
  for (const l of dobrar(paraTexto(narracaoDoMestre(id, []))).split('\n')) {
    linha(l ? '     ' + l : '');
  }
  linha();

  /* o que a turma faz agora */
  const escolhas = carta.escolhas || [];
  const ehDecisao = escolhas.length > 1;

  if (ehDecisao) {
    linha('     ---------- A TURMA VOTA ENTRE ----------');
    linha();
    for (const e of escolhas) {
      const f = e.filosofo && FILOSOFOS[e.filosofo];
      linha(`     ${e.id.toUpperCase()}) ${e.titulo}${f ? '  —  ' + f.nomeExibicao : ''}`);
      if (e.destino) {
        const alvo = cartas[e.destino];
        const marca = alvo.tipo === 'consequencia' ? ` (consequencia ${e.id.toUpperCase()})` : '';
        linha(`        depois do voto, va para: ${alvo.titulo}${marca}`);
      }
      linha();
    }
    linha('     Em caso de empate, quem decide e voce.');
  } else if (escolhas.length === 1) {
    linha(`     ---------- ${ehConsequencia ? 'SIGA' : 'SEM VOTACAO'} ----------`);
    linha();
    linha(`     Toque em "${escolhas[0].titulo}" e confirme.`);
    linha(`     A tela vai para: ${cartas[escolhas[0].destino].titulo}`);
  } else {
    linha('     ---------- FIM DA SESSAO ----------');
    linha();
    linha(dobrar(
      '     A tela mostra o caminho filosofico percorrido e a contagem de ' +
      'cada filosofo. Bom momento para abrir a discussao com a turma.'
    ));
  }
  linha();
}

linha();
regua();
linha('fim do roteiro');
regua();
linha();

fs.writeFileSync(SAIDA, L.join('\n'), 'utf8');
console.log('');
console.log('  Roteiro do Mestre gerado.');
console.log(`  ${Object.keys(cartas).length} cartas · ${L.join('\n').length} caracteres`);
console.log(`  Arquivo: roteiro-do-mestre.txt`);
console.log('');
