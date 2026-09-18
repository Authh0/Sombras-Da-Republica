/* =============================================================================
 *  REGRAS DO JOGO  --  logica pura, sem tela e sem rede
 * =============================================================================
 *  Este arquivo e usado por tres lugares ao mesmo tempo:
 *    - o servidor      (para decidir o que e permitido)
 *    - o navegador     (para desenhar a carta certa)
 *    - o verificador   (npm run check-historia)
 *
 *  Como ele nao usa nada do Node nem nada do navegador, roda nos tres.
 *  Se voce mudar uma regra aqui, ela muda em todos de uma vez -- e por isso
 *  que servidor e cliente nunca discordam sobre o estado do jogo.
 * ========================================================================== */

import { cartas, FILOSOFOS, CENA_INICIAL, CENA_FINAL } from './historia.js';

export { cartas, FILOSOFOS, CENA_INICIAL, CENA_FINAL };

export const IDS_FILOSOFOS = Object.keys(FILOSOFOS);

/* -----------------------------------------------------------------------------
 *  As fases, na ordem em que aparecem na historia.
 *  A lista e montada a partir das cartas, entao se voces criarem uma fase nova
 *  em historia.js ela entra sozinha na trilha do topo da tela -- nao precisa
 *  mexer em mais nada.
 * -------------------------------------------------------------------------- */
export const FASES = (() => {
  const ordem = [];
  for (const id of Object.keys(cartas)) {
    const fase = cartas[id].fase;
    if (fase && !ordem.includes(fase)) ordem.push(fase);
  }
  return ordem;
})();

export function indiceDaFase(fase) {
  return FASES.indexOf(fase);
}

/* -----------------------------------------------------------------------------
 *  Conta quantas vezes cada filosofo foi escolhido ate agora.
 *  historico = [{ cartaId, escolhaId, filosofo }, ...]
 * -------------------------------------------------------------------------- */
export function contarFilosofos(historico = []) {
  const contagem = {};
  for (const id of IDS_FILOSOFOS) contagem[id] = 0;

  for (const passo of historico) {
    if (passo && passo.filosofo && contagem[passo.filosofo] !== undefined) {
      contagem[passo.filosofo] += 1;
    }
  }
  return contagem;
}

/* -----------------------------------------------------------------------------
 *  Qual filosofo esta dominando a sessao.
 *
 *  Regra de desempate: se dois filosofos empatam na frente, vence aquele que
 *  foi escolhido MAIS RECENTEMENTE. Assim a tendencia sempre reflete para onde
 *  o grupo esta indo agora, e nunca fica indefinida no meio do jogo.
 *
 *  Retorna o id do filosofo, ou null se ninguem escolheu nada ainda.
 * -------------------------------------------------------------------------- */
export function tendenciaDominante(historico = []) {
  const contagem = contarFilosofos(historico);
  const maior = Math.max(...Object.values(contagem));
  if (maior === 0) return null;

  const empatados = IDS_FILOSOFOS.filter((id) => contagem[id] === maior);
  if (empatados.length === 1) return empatados[0];

  // desempate pelo mais recente
  for (let i = historico.length - 1; i >= 0; i--) {
    const f = historico[i] && historico[i].filosofo;
    if (f && empatados.includes(f)) return f;
  }
  return empatados[0];
}

/* -----------------------------------------------------------------------------
 *  Monta a carta ja com a variante de texto certa aplicada.
 *
 *  Se a variante da tendencia atual existir e estiver preenchida, ela e usada.
 *  Se estiver vazia, cai no texto base -- o jogo NUNCA quebra por falta de
 *  texto. O verificador e quem avisa que falta escrever.
 * -------------------------------------------------------------------------- */
export function montarCarta(cartaId, historico = []) {
  const base = cartas[cartaId];
  if (!base) return null;

  const tendencia = tendenciaDominante(historico);
  const variante = tendencia && base.variantes ? base.variantes[tendencia] : null;

  // Marca se ALGUM campo veio da variante. Se olhassemos so o "texto",
  // uma variante que muda apenas o "momento" passaria despercebida e o selo
  // "Versao Kant" nao apareceria na tela.
  let usouVariante = false;

  const escolher = (campo) => {
    const alternativo = variante && typeof variante[campo] === 'string' ? variante[campo].trim() : '';
    if (alternativo !== '') {
      usouVariante = true;
      return alternativo;
    }
    return base[campo] || '';
  };

  const titulo = escolher('titulo');
  const momento = escolher('momento');
  const texto = escolher('texto');
  const pergunta = escolher('pergunta');

  return {
    id: cartaId,
    fase: base.fase,
    // 'cena' = carta de decisao; 'consequencia' = resposta a uma escolha
    tipo: base.tipo || 'cena',
    // nas consequencias, o filosofo cuja escolha levou ate aqui
    filosofo: base.filosofo || null,
    titulo,
    momento,
    texto,
    pergunta,
    citacaoFinal: base.citacaoFinal || null,
    narracao: base.narracao || null,
    mapa: base.mapa || null,
    escolhas: base.escolhas || [],
    tendencia,
    // qual versao esta na tela (aparece como selo na carta)
    varianteUsada: usouVariante ? tendencia : null,
  };
}

/* -----------------------------------------------------------------------------
 *  O ROTEIRO DO MESTRE
 * -----------------------------------------------------------------------------
 *  Devolve exatamente o que o Mestre le em voz alta nesta carta.
 *
 *  Na maioria das cartas o roteiro e o proprio texto da tela, montado na
 *  ordem em que ele deve ser falado. Duas diferencas de proposito:
 *
 *  1. Nas cartas de consequencia, a linha em italico ("O grupo escolheu a
 *     prudencia") NAO entra: ela e rotulo de tela, escrito para o jogador se
 *     situar, e nao faz parte do texto do Mestre.
 *
 *  2. Quando uma carta tem o campo "narracao", ele manda. E o caso da Carta 4,
 *     em que o documento do Mestre traz a pergunta no meio e a tela a mostra
 *     no fim.
 * -------------------------------------------------------------------------- */
export function narracaoDoMestre(cartaId, historico = []) {
  const carta = montarCarta(cartaId, historico);
  if (!carta) return '';
  if (carta.narracao) return carta.narracao;

  const partes = [];
  if (carta.tipo !== 'consequencia' && carta.momento) partes.push(carta.momento);
  if (carta.texto) partes.push(carta.texto);
  if (carta.pergunta) partes.push(carta.pergunta);
  if (carta.citacaoFinal) partes.push(carta.citacaoFinal);

  return partes.join('<br><br>');
}

/* -----------------------------------------------------------------------------
 *  Para onde esta carta pode levar. O servidor usa isso para recusar
 *  qualquer tentativa de pular cenas.
 * -------------------------------------------------------------------------- */
export function destinosValidos(cartaId) {
  const carta = cartas[cartaId];
  if (!carta || !Array.isArray(carta.escolhas)) return [];
  return carta.escolhas.map((e) => e.destino);
}

/* -----------------------------------------------------------------------------
 *  Procura uma escolha especifica dentro de uma carta.
 * -------------------------------------------------------------------------- */
export function acharEscolha(cartaId, escolhaId) {
  const carta = cartas[cartaId];
  if (!carta || !Array.isArray(carta.escolhas)) return null;
  return carta.escolhas.find((e) => e.id === escolhaId) || null;
}

/* -----------------------------------------------------------------------------
 *  Apura os votos de uma carta.
 *
 *  votos = { socketId: escolhaId, ... }
 *  Devolve a contagem por escolha, o total e quem esta na frente
 *  (vencedor = null quando ha empate, para o Mestre desempatar).
 * -------------------------------------------------------------------------- */
export function apurarVotos(cartaId, votos = {}) {
  const carta = cartas[cartaId];
  const contagem = {};
  if (carta && Array.isArray(carta.escolhas)) {
    for (const e of carta.escolhas) contagem[e.id] = 0;
  }

  let total = 0;
  for (const escolhaId of Object.values(votos)) {
    if (contagem[escolhaId] !== undefined) {
      contagem[escolhaId] += 1;
      total += 1;
    }
  }

  const maior = total > 0 ? Math.max(...Object.values(contagem)) : 0;
  const lideres = Object.keys(contagem).filter((id) => contagem[id] === maior && maior > 0);

  return {
    contagem,
    total,
    vencedor: lideres.length === 1 ? lideres[0] : null,
    empate: lideres.length > 1,
    lideres,
  };
}

/* -----------------------------------------------------------------------------
 *  QUORUM  --  este jogo NAO e para um jogador so
 * -----------------------------------------------------------------------------
 *  O jogo e cooperativo: a turma delibera e vota, e o Mestre confirma. Sem
 *  esta regra o Mestre conseguia ir do prologo ao final com ZERO jogadores
 *  conectados e ZERO votos -- na pratica um single-player, que e exatamente o
 *  que o trabalho nao pode ser.
 *
 *  A regra vale so nas CARTAS DE DECISAO. As cartas de leitura (prologo,
 *  abertura e as consequencias) tem uma saida so e nao tem o que votar: se
 *  elas fossem travadas, o Mestre nao conseguiria nem colocar o prologo na
 *  tela enquanto a turma ainda esta entrando.
 * -------------------------------------------------------------------------- */
export const MINIMO_JOGADORES = 2;

/* Carta de decisao e a que oferece mais de um caminho. O teste sai da propria
   historia, entao carta nova em historia.js ja entra na regra sozinha. */
export function cartaEDecisao(cartaId) {
  const carta = cartas[cartaId];
  if (!carta || !Array.isArray(carta.escolhas)) return false;
  return carta.escolhas.length > 1;
}

/* -----------------------------------------------------------------------------
 *  Confere se a sessao pode avancar desta carta.
 *
 *  Exige as DUAS coisas: gente conectada e voto dado. Sao checagens
 *  diferentes -- dois celulares abertos e ninguem votando nao e deliberacao.
 *
 *  Quem chama passa os numeros que ja tem em maos:
 *    presenca  = { jogadores, mestres, total }   (do servidor)
 *    apuracao  = { total, ... }                  (de apurarVotos)
 *
 *  Servidor e navegador chamam esta MESMA funcao, entao a mensagem que o
 *  Mestre le na tela e exatamente o motivo pelo qual o servidor recusaria.
 * -------------------------------------------------------------------------- */
export function conferirQuorum(cartaId, presenca = {}, apuracao = {}) {
  const jogadores = Number(presenca && presenca.jogadores) || 0;
  const votos = Number(apuracao && apuracao.total) || 0;
  const minimo = MINIMO_JOGADORES;

  if (!cartaEDecisao(cartaId)) {
    return { ok: true, exigido: false, jogadores, votos, minimo, faltaJogador: false, faltaVoto: false, motivo: '' };
  }

  const faltaJogador = jogadores < minimo;
  const faltaVoto = votos < minimo;

  let motivo = '';
  if (faltaJogador && faltaVoto) {
    motivo =
      `Decisão da turma: precisa de pelo menos ${minimo} jogadores na sessão e ${minimo} votos. ` +
      `Agora há ${jogadores} jogador(es) e ${votos} voto(s).`;
  } else if (faltaJogador) {
    motivo =
      `Decisão da turma: precisa de pelo menos ${minimo} jogadores na sessão. Agora há ${jogadores}.`;
  } else if (faltaVoto) {
    motivo = `Faltam votos: precisa de pelo menos ${minimo}, e há ${votos}.`;
  }

  return {
    ok: !faltaJogador && !faltaVoto,
    exigido: true,
    jogadores,
    votos,
    minimo,
    faltaJogador,
    faltaVoto,
    motivo,
  };
}

/* -----------------------------------------------------------------------------
 *  O caminho filosofico da sessao, em nomes bonitos, para mostrar no final.
 * -------------------------------------------------------------------------- */
export function caminhoEmNomes(historico = []) {
  return historico
    .filter((p) => p && p.filosofo && FILOSOFOS[p.filosofo])
    .map((p) => FILOSOFOS[p.filosofo].nomeExibicao);
}
