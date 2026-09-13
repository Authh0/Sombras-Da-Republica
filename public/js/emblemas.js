/* =============================================================================
 *  EMBLEMAS DOS FILOSOFOS
 * =============================================================================
 *  Tres medalhoes desenhados em SVG, um para cada filosofo. Sao desenhos
 *  proprios do projeto -- nenhuma imagem foi copiada de lugar nenhum, entao
 *  nao ha questao de direito autoral e nada precisa ser creditado.
 *
 *  Por que SVG e nao foto: o desenho e escrito em texto (uns 2 KB cada),
 *  carrega instantaneamente mesmo em internet ruim, fica nitido em qualquer
 *  tela e herda a cor do filosofo sozinho, porque usa "currentColor".
 *
 *  O que cada um representa:
 *    Aristoteles -> a balanca em equilibrio: a virtude como meio-termo
 *    Kant        -> o ceu estrelado sobre o horizonte e o ponto abaixo dele:
 *                   "o ceu estrelado acima de mim, a lei moral dentro de mim"
 *    Maquiavel   -> a raposa coroada: a astucia que chegou ao poder
 * ========================================================================== */

const moldura = '<circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".45"/>';

export const EMBLEMAS = {
  /* ---- ARISTOTELES: a balanca ------------------------------------------- */
  aristoteles: `
    ${moldura}
    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 18v28"/>
      <path d="M24 46h16"/>
      <path d="M14 23h36"/>
      <path d="M14 23v7"/>
      <path d="M50 23v7"/>
      <path d="M7 30q7 9 14 0"/>
      <path d="M43 30q7 9 14 0"/>
    </g>
    <circle cx="32" cy="17" r="2.6" fill="currentColor"/>
    <path d="M27 46h10l2 4H25z" fill="currentColor"/>
  `,

  /* ---- KANT: o ceu estrelado e a lei moral -------------------------------- */
  kant: `
    ${moldura}
    <g fill="currentColor">
      <path d="M33 13l1.6 5.4L40 20l-5.4 1.6L33 27l-1.6-5.4L26 20l5.4-1.6z"/>
      <path d="M21 25l1.2 4L26 30.2l-3.8 1.2L21 35l-1.2-3.6L16 30.2l3.8-1.2z"/>
      <path d="M45 26l1.2 4 3.8 1.2-3.8 1.2L45 36l-1.2-3.6L40 31.2l3.8-1.2z"/>
    </g>
    <path d="M11 45q21-7 42 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="52" r="3.2" fill="currentColor"/>
  `,

  /* ---- MAQUIAVEL: a raposa coroada ---------------------------------------
   * A coroa flutua acima, separada da cabeca, para as duas formas nao se
   * misturarem num borrao so quando o emblema aparece pequeno. As orelhas
   * sao triangulos altos e o focinho afina ate uma ponta -- e o afinamento
   * que faz o desenho ler como raposa, e nao como gato.
   * -------------------------------------------------------------------- */
  maquiavel: `
    ${moldura}
    <path d="M23 17l2.5-9 3.5 5 3-7 3 7 3.5-5L41 17z" fill="currentColor"/>
    <path d="M23 17h18v2.5H23z" fill="currentColor"/>
    <path d="M21 32l-2-11 10 7z" fill="currentColor"/>
    <path d="M43 32l2-11-10 7z" fill="currentColor"/>
    <path d="M21 32q11-5 22 0l-11 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="27" cy="36" r="1.9" fill="currentColor"/>
    <circle cx="37" cy="36" r="1.9" fill="currentColor"/>
    <path d="M32 45.5l-2.2 2.4L32 50.5l2.2-2.6z" fill="currentColor"/>
  `,
};

/* -----------------------------------------------------------------------------
 *  Devolve o SVG pronto para colocar na tela.
 *  tamanho = lado em pixels. A cor vem do CSS de quem o contem.
 * -------------------------------------------------------------------------- */
export function emblema(filosofoId, tamanho = 28) {
  const desenho = EMBLEMAS[filosofoId];
  if (!desenho) return '';
  return `<svg class="emblema" viewBox="0 0 64 64" width="${tamanho}" height="${tamanho}" aria-hidden="true" focusable="false">${desenho}</svg>`;
}
