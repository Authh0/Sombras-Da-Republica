/* =============================================================================
 *  SOMBRAS DA REPUBLICA -- cliente
 * =============================================================================
 *  Este arquivo so DESENHA a tela e MANDA pedidos para o servidor.
 *  Ele nunca decide nada sozinho: quem e Mestre, se a escolha vale, para onde
 *  a historia vai -- tudo isso e decidido no servidor. Mexer no console daqui
 *  nao muda a sessao de ninguem.
 *
 *  Repare que importamos os MESMOS arquivos que o servidor usa. E por isso que
 *  a tela nunca discorda do servidor sobre qual carta esta no ar.
 * ========================================================================== */

import {
  FILOSOFOS,
  CENA_FINAL,
  FASES,
  indiceDaFase,
  montarCarta,
  tendenciaDominante,
  contarFilosofos,
} from '/src/regras.js';

import { emblema } from './emblemas.js';

/* -----------------------------------------------------------------------------
 *  Atalhos de DOM
 * -------------------------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

const el = {
  lobby: $('lobby'),
  lobbyEmblemas: $('lobby-emblemas'),
  lobbyPresenca: $('lobby-presenca'),
  btnJogador: $('btn-jogador'),
  btnMestre: $('btn-mestre'),
  formMestre: $('form-mestre'),
  campoSenha: $('campo-senha'),
  erroSenha: $('erro-senha'),
  btnCancelarMestre: $('btn-cancelar-mestre'),

  app: $('app'),
  etiquetaPapel: $('etiqueta-papel'),
  etiquetaEssencia: $('etiqueta-essencia'),
  valorFase: $('valor-fase'),
  valorEssencia: $('valor-essencia'),
  valorOnline: $('valor-online'),
  trilha: $('trilha'),

  areaHistoria: $('area-historia'),
  areaEscolhas: $('area-escolhas'),

  painelMestre: $('painel-mestre'),
  dicaMestre: $('dica-mestre'),
  btnConfirmar: $('btn-confirmar'),
  btnVoltar: $('btn-voltar'),
  btnReiniciar: $('btn-reiniciar'),

  btnMapa: $('btn-mapa'),
  btnSair: $('btn-sair'),
  modalMapa: $('modal-mapa'),
  btnFecharMapa: $('btn-fechar-mapa'),
  marcador: $('marcador'),
  mapaLegenda: $('mapa-legenda'),

  modalConfirma: $('modal-confirma'),
  confirmaTitulo: $('confirma-titulo'),
  confirmaTexto: $('confirma-texto'),
  btnConfirmaSim: $('btn-confirma-sim'),
  btnConfirmaNao: $('btn-confirma-nao'),

  barraConexao: $('barra-conexao'),
  barraConexaoTexto: $('barra-conexao-texto'),
  avisos: $('avisos'),
};

/* -----------------------------------------------------------------------------
 *  Estado local (so de interface)
 * -------------------------------------------------------------------------- */
const local = {
  papel: null, // 'jogador' | 'mestre' -- confirmado pelo servidor
  entrou: false,
  meuVoto: null,
  selecionada: null, // escolha que o Mestre marcou mas ainda nao confirmou
  servidor: null, // ultimo estado recebido
  cenaDesenhada: null, // evita redesenhar a mesma carta e piscar a tela
};

/* Mantemos o polling como alternativa: em rede de escola e atras de proxy,
   so WebSocket as vezes nao conecta de jeito nenhum. */
const socket = io({ transports: ['websocket', 'polling'] });

/* -----------------------------------------------------------------------------
 *  Avisos na tela (no lugar do alert(), que travava a pagina)
 * -------------------------------------------------------------------------- */
function aviso(mensagem, duracao = 3800) {
  const caixa = document.createElement('div');
  caixa.className = 'aviso';
  caixa.textContent = mensagem;
  el.avisos.appendChild(caixa);
  setTimeout(() => caixa.remove(), duracao);
}

/* -----------------------------------------------------------------------------
 *  Caixa de confirmacao (no lugar do confirm() do navegador)
 * -------------------------------------------------------------------------- */
let resolverConfirma = null;

function confirmar(titulo, texto, rotuloSim) {
  el.confirmaTitulo.textContent = titulo;
  el.confirmaTexto.textContent = texto;
  el.btnConfirmaSim.textContent = rotuloSim;
  el.modalConfirma.hidden = false;
  el.btnConfirmaNao.focus();
  return new Promise((resolve) => {
    resolverConfirma = resolve;
  });
}

function fecharConfirma(resposta) {
  el.modalConfirma.hidden = true;
  if (resolverConfirma) {
    resolverConfirma(resposta);
    resolverConfirma = null;
  }
}

el.btnConfirmaSim.addEventListener('click', () => fecharConfirma(true));
el.btnConfirmaNao.addEventListener('click', () => fecharConfirma(false));
el.modalConfirma.addEventListener('click', (e) => {
  if (e.target === el.modalConfirma) fecharConfirma(false);
});

/* -----------------------------------------------------------------------------
 *  LOBBY
 * -------------------------------------------------------------------------- */
/* Os tres emblemas decoram a tela inicial */
el.lobbyEmblemas.innerHTML = Object.values(FILOSOFOS)
  .map((f) => `<span style="color:${f.cor}">${emblema(f.id, 34)}</span>`)
  .join('');

el.btnJogador.addEventListener('click', () => {
  socket.emit('entrar_como_jogador', {}, (r) => {
    if (r && r.ok) {
      local.papel = 'jogador';
      abrirJogo();
    }
  });
});

el.btnMestre.addEventListener('click', () => {
  el.formMestre.hidden = false;
  el.campoSenha.focus();
});

el.btnCancelarMestre.addEventListener('click', () => {
  el.formMestre.hidden = true;
  el.erroSenha.hidden = true;
  el.campoSenha.value = '';
});

el.formMestre.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const senha = el.campoSenha.value;

  socket.emit('autenticar_mestre', { senha }, (r) => {
    if (r && r.ok) {
      local.papel = 'mestre';
      el.campoSenha.value = '';
      el.erroSenha.hidden = true;
      el.formMestre.hidden = true;
      abrirJogo();
      aviso('Bem-vindo, Mestre da sessão.');
    } else {
      el.erroSenha.textContent = (r && r.erro) || 'Não foi possível entrar.';
      el.erroSenha.hidden = false;
      el.campoSenha.select();
    }
  });
});

function abrirJogo() {
  local.entrou = true;
  local.cenaDesenhada = null;
  el.lobby.hidden = true;
  el.app.hidden = false;
  renderizar();
}

/* ---- sair da sessao e voltar ao menu ------------------------------------- */
function voltarAoMenu() {
  // Avisa o servidor para rebaixar o papel. Sem isso, quem saiu continuaria
  // podendo mandar comandos de Mestre pela conexao que ja estava aberta.
  socket.emit('sair', {});

  local.papel = 'jogador';
  local.entrou = false;
  local.meuVoto = null;
  local.selecionada = null;
  local.cenaDesenhada = null;

  el.app.hidden = true;
  el.formMestre.hidden = true;
  el.erroSenha.hidden = true;
  el.campoSenha.value = '';
  el.lobby.hidden = false;
  el.btnJogador.focus();
  atualizarPresencaLobby();
}

el.btnSair.addEventListener('click', voltarAoMenu);

/* -----------------------------------------------------------------------------
 *  EVENTOS DO SERVIDOR
 * -------------------------------------------------------------------------- */
socket.on('bem-vindo', (dados) => {
  local.servidor = dados.estado;
  if (local.entrou) renderizar();
  else atualizarPresencaLobby();
});

socket.on('estado', (estado) => {
  const mudouDeCarta = !local.servidor || local.servidor.cena !== estado.cena;
  local.servidor = estado;

  // carta nova: o voto e a selecao anteriores nao valem mais
  if (mudouDeCarta) {
    local.meuVoto = null;
    local.selecionada = null;
  }

  if (local.entrou) renderizar();
  else atualizarPresencaLobby();
});

socket.on('apuracao', (dados) => {
  if (!local.servidor) return;
  local.servidor.apuracao = dados.apuracao;
  local.servidor.presenca = dados.presenca;

  if (!local.entrou) return atualizarPresencaLobby();

  atualizarContagens();
  // a dica do Mestre mostra a apuracao em texto, entao precisa acompanhar
  // cada voto que chega -- nao so as trocas de carta
  if (local.papel === 'mestre') atualizarDicaMestre();
});

function atualizarPresencaLobby() {
  const total = local.servidor && local.servidor.presenca ? local.servidor.presenca.total : 0;
  el.lobbyPresenca.textContent = total === 1 ? '1 pessoa na sessão' : `${total} pessoas na sessão`;
}

/* ---- conexao ------------------------------------------------------------- */
socket.on('connect', () => {
  el.barraConexao.hidden = true;

  // Ao reconectar, o papel de Mestre precisa ser provado de novo: a conexao
  // e outra. Melhor avisar do que deixar o Mestre achando que tem controle.
  if (local.papel === 'mestre') {
    local.papel = 'jogador';
    local.entrou = false;
    el.app.hidden = true;
    el.lobby.hidden = false;
    el.formMestre.hidden = false;
    aviso('A conexão caiu. Entre com a senha do Mestre novamente.', 6500);
  }
});

socket.on('disconnect', () => {
  el.barraConexao.hidden = false;
  el.barraConexao.dataset.estado = 'offline';
  el.barraConexaoTexto.textContent = 'Conexão perdida. Tentando voltar…';
});

socket.io.on('reconnect_attempt', () => {
  el.barraConexao.hidden = false;
  el.barraConexao.dataset.estado = 'tentando';
  el.barraConexaoTexto.textContent = 'Reconectando…';
});

/* -----------------------------------------------------------------------------
 *  DESENHO DA TELA
 * -------------------------------------------------------------------------- */
function renderizar() {
  const estado = local.servidor;
  if (!estado) return;

  const carta = montarCarta(estado.cena, estado.historico);
  if (!carta) return;

  const cartaNova = local.cenaDesenhada !== estado.cena;
  local.cenaDesenhada = estado.cena;

  atualizarPainel(carta, estado);
  desenharTrilha(carta);

  if (estado.cena === CENA_FINAL) {
    desenharFinal(carta, estado);
  } else {
    desenharCarta(carta, cartaNova);
    desenharEscolhas(carta, estado);
  }

  atualizarPainelMestre(carta, estado);
  atualizarMapa(carta);
}

function atualizarPainel(carta, estado) {
  const ehMestre = local.papel === 'mestre';

  el.etiquetaPapel.textContent = ehMestre ? 'Mestre' : 'Jogador';
  el.etiquetaPapel.classList.toggle('etiqueta-mestre', ehMestre);

  el.valorFase.textContent = carta.fase;

  const tendencia = tendenciaDominante(estado.historico);
  el.valorEssencia.textContent = tendencia ? FILOSOFOS[tendencia].nomeExibicao : 'Observador';
  el.etiquetaEssencia.style.color = tendencia ? FILOSOFOS[tendencia].cor : '';

  const presenca = estado.presenca || { total: 0 };
  el.valorOnline.textContent = presenca.total;
}

/* Trilha de losangos com o nome da fase atual */
function desenharTrilha(carta) {
  const atual = indiceDaFase(carta.fase);
  const partes = [];

  FASES.forEach((fase, i) => {
    const estadoPasso = i < atual ? 'passou' : i === atual ? 'atual' : 'falta';
    if (i > 0) partes.push('<span class="trilha-traco"></span>');
    partes.push(
      `<span class="trilha-passo" data-estado="${estadoPasso}" title="${fase}">` +
        '<span class="trilha-ponto"></span>' +
        `<span class="trilha-nome">${fase}</span>` +
        '</span>'
    );
  });

  el.trilha.innerHTML = partes.join('');
}

function desenharCarta(carta, animar) {
  const partes = [];

  partes.push('<header class="carta-cabecalho">');

  // Carta de consequencia: mostra de quem foi o caminho que levou ate aqui.
  if (carta.tipo === 'consequencia' && carta.filosofo && FILOSOFOS[carta.filosofo]) {
    const f = FILOSOFOS[carta.filosofo];
    partes.push(`<div class="carta-selo" style="color:${f.cor}">${emblema(f.id, 64)}</div>`);
    partes.push(
      `<span class="selo-filosofo" style="color:${f.cor}">Caminho de ${f.nomeExibicao}</span>`
    );
  }

  partes.push(`<p class="carta-fase">${carta.fase}</p>`);
  partes.push(`<h2>${carta.titulo}</h2>`);
  partes.push('<div class="filete">\u25C6</div>');
  if (carta.momento) partes.push(`<p class="carta-momento">${carta.momento}</p>`);

  if (carta.varianteUsada) {
    const f = FILOSOFOS[carta.varianteUsada];
    partes.push(`<span class="selo-variante">Versão ${f.nomeExibicao}</span>`);
  }
  partes.push('</header>');

  if (carta.texto) partes.push(`<div class="carta-texto">${carta.texto}</div>`);
  if (carta.pergunta) partes.push(`<div class="pergunta-central">${carta.pergunta}</div>`);

  el.areaHistoria.innerHTML = partes.join('');
  el.areaHistoria.dataset.animar = animar ? 'sim' : 'nao';
}

function desenharEscolhas(carta, estado) {
  el.areaEscolhas.innerHTML = '';
  const ehMestre = local.papel === 'mestre';

  // "Passagem" = carta sem decisao de verdade (prologo, abertura e as
  // consequencias): uma unica saida, sem filosofo. Nao faz sentido pedir voto
  // nem mostrar contador aqui -- o jogador so acompanha a leitura.
  const ehPassagem = carta.escolhas.length === 1 && !carta.escolhas[0].filosofo;

  if (ehPassagem && !ehMestre) {
    const nota = document.createElement('p');
    nota.className = 'nota-espera';
    nota.textContent = 'Aguarde: o Mestre segue a narrativa.';
    el.areaEscolhas.appendChild(nota);
    return;
  }

  for (const escolha of carta.escolhas) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'escolha';
    botao.dataset.escolha = escolha.id;
    if (escolha.filosofo) botao.dataset.filosofo = escolha.filosofo;

    const barra = document.createElement('div');
    barra.className = 'escolha-barra';
    botao.appendChild(barra);

    /* topo: emblema + titulo + nome do filosofo */
    const topo = document.createElement('div');
    topo.className = 'escolha-topo';

    if (escolha.filosofo && FILOSOFOS[escolha.filosofo]) {
      const marca = document.createElement('span');
      marca.className = 'escolha-emblema';
      marca.dataset.filosofo = escolha.filosofo;
      marca.innerHTML = emblema(escolha.filosofo, 32);
      topo.appendChild(marca);
    }

    const titulo = document.createElement('div');
    titulo.className = 'escolha-titulo';
    const letra = ehPassagem ? '' : `<span class="escolha-letra">${escolha.id.toUpperCase()}.</span> `;
    titulo.innerHTML = letra + escolha.titulo;
    if (escolha.filosofo && FILOSOFOS[escolha.filosofo]) {
      const f = FILOSOFOS[escolha.filosofo];
      titulo.innerHTML += `<span class="filosofo-tag" data-filosofo="${f.id}">${f.nomeExibicao}</span>`;
    }
    topo.appendChild(titulo);
    botao.appendChild(topo);

    if (escolha.citacao) {
      const citacao = document.createElement('div');
      citacao.className = 'escolha-citacao';
      citacao.textContent = escolha.citacao;
      botao.appendChild(citacao);
    }

    if (escolha.desc) {
      const desc = document.createElement('div');
      desc.className = 'escolha-desc';
      desc.textContent = escolha.desc;
      botao.appendChild(desc);
    }

    // Numa passagem nao existe apuracao: o rodape viraria "0 votos" para sempre.
    if (!ehPassagem) {
      const rodape = document.createElement('div');
      rodape.className = 'escolha-rodape';
      rodape.innerHTML =
        `<span class="rodape-acao">${ehMestre ? 'Tocar para selecionar' : 'Tocar para votar'}</span>` +
        '<span class="contagem-votos">0 votos</span>';
      botao.appendChild(rodape);
    }

    botao.addEventListener('click', () => {
      if (ehMestre) selecionarComoMestre(escolha.id);
      else votar(escolha.id);
    });

    el.areaEscolhas.appendChild(botao);
  }

  atualizarContagens();
}

/* Atualiza so os numeros -- nao redesenha a carta inteira a cada voto,
   senao a tela pisca no meio da votacao. */
function atualizarContagens() {
  const estado = local.servidor;
  if (!estado || !estado.apuracao) return;

  const { contagem, total } = estado.apuracao;

  for (const botao of el.areaEscolhas.querySelectorAll('.escolha')) {
    const id = botao.dataset.escolha;
    const votos = contagem[id] || 0;
    const proporcao = total > 0 ? (votos / total) * 100 : 0;

    const barra = botao.querySelector('.escolha-barra');
    if (barra) barra.style.width = `${proporcao}%`;

    const numero = botao.querySelector('.contagem-votos');
    if (numero) numero.textContent = votos === 1 ? '1 voto' : `${votos} votos`;

    botao.dataset.meuVoto = String(local.meuVoto === id);
    botao.dataset.selecionada = String(local.selecionada === id);

    const acao = botao.querySelector('.rodape-acao');
    if (acao) {
      if (local.papel === 'mestre') {
        acao.textContent = local.selecionada === id ? 'Selecionada' : 'Tocar para selecionar';
      } else {
        acao.textContent = local.meuVoto === id ? 'Seu voto' : 'Tocar para votar';
      }
    }
  }

  if (el.valorOnline && estado.presenca) el.valorOnline.textContent = estado.presenca.total;
}

/* -----------------------------------------------------------------------------
 *  ACOES
 * -------------------------------------------------------------------------- */
function votar(escolhaId) {
  local.meuVoto = escolhaId;
  socket.emit('votar', { escolhaId });
  atualizarContagens();
}

function selecionarComoMestre(escolhaId) {
  local.selecionada = escolhaId;
  el.btnConfirmar.disabled = false;
  atualizarContagens();
  atualizarDicaMestre();
}

el.btnConfirmar.addEventListener('click', () => {
  if (!local.selecionada || !local.servidor) return;

  el.btnConfirmar.disabled = true; // trava o clique duplo ja aqui
  socket.emit(
    'mestre_avancar',
    { escolhaId: local.selecionada, versao: local.servidor.versao },
    (r) => {
      if (!r || !r.ok) {
        aviso((r && r.erro) || 'Não foi possível avançar.');
        el.btnConfirmar.disabled = false;
      }
    }
  );
});

el.btnVoltar.addEventListener('click', () => {
  socket.emit('mestre_voltar', {}, (r) => {
    if (!r || !r.ok) aviso((r && r.erro) || 'Não foi possível voltar.');
  });
});

el.btnReiniciar.addEventListener('click', async () => {
  const certeza = await confirmar(
    'Reiniciar a sessão?',
    'Todo o caminho filosófico registrado será apagado e a turma volta ao prólogo.',
    'Sim, reiniciar'
  );
  if (!certeza) return;

  socket.emit('mestre_reiniciar', {}, (r) => {
    if (!r || !r.ok) aviso((r && r.erro) || 'Não foi possível reiniciar.');
    else aviso('Sessão reiniciada.');
  });
});

function atualizarPainelMestre(carta, estado) {
  const ehMestre = local.papel === 'mestre';
  el.painelMestre.hidden = !ehMestre;
  if (!ehMestre) return;

  el.btnVoltar.disabled = !estado.historico || estado.historico.length === 0;
  el.btnConfirmar.disabled = !local.selecionada;
  el.btnConfirmar.hidden = estado.cena === CENA_FINAL;
  atualizarDicaMestre();
}

function atualizarDicaMestre() {
  const estado = local.servidor;
  if (!estado) return;

  if (estado.cena === CENA_FINAL) {
    el.dicaMestre.textContent = 'A sessão chegou ao fim. Você pode voltar uma carta ou reiniciar.';
    return;
  }

  // Carta de leitura, sem decisão: não há votação a relatar.
  const carta = montarCarta(estado.cena, estado.historico);
  if (carta && carta.escolhas.length === 1 && !carta.escolhas[0].filosofo) {
    el.dicaMestre.textContent =
      'Carta de leitura — sem votação. Leia em voz alta e confirme para seguir.';
    return;
  }

  const ap = estado.apuracao || { total: 0, vencedor: null, empate: false };
  if (ap.total === 0) {
    el.dicaMestre.textContent = 'Ninguém votou ainda. Você pode esperar ou decidir por conta.';
  } else if (ap.empate) {
    el.dicaMestre.textContent = `${ap.total} voto(s), empate — o desempate é seu.`;
  } else {
    el.dicaMestre.textContent = `${ap.total} voto(s) registrado(s). Maioria na opção ${String(
      ap.vencedor
    ).toUpperCase()}.`;
  }
}

/* -----------------------------------------------------------------------------
 *  FINAL
 * -------------------------------------------------------------------------- */
function desenharFinal(carta, estado) {
  const contagem = contarFilosofos(estado.historico);
  const dominante = tendenciaDominante(estado.historico);

  // Montamos direto do historico: cada passo carrega o id do filosofo, entao
  // pegamos o nome e a cor da mesma fonte, sem depender de casar textos.
  const passos = estado.historico.map((passo) => FILOSOFOS[passo.filosofo]).filter(Boolean);

  const itens = passos.length
    ? passos
        .map(
          (f) =>
            `<span class="caminho-item" style="color:${f.cor}">${emblema(f.id, 18)}${f.nomeExibicao}</span>`
        )
        .join('')
    : '<span class="caminho-item" style="color:#6b6355">Nenhuma escolha registrada</span>';

  const placar = Object.values(FILOSOFOS)
    .map(
      (f) =>
        `<div class="placar-item" style="color:${f.cor}">` +
        `<span class="placar-numero">${contagem[f.id]}</span>` +
        `<span class="placar-nome">${f.nomeExibicao}</span>` +
        '</div>'
    )
    .join('');

  const resumo = dominante
    ? `Tendência dominante da sessão: <strong style="color:${FILOSOFOS[dominante].cor}">${FILOSOFOS[dominante].nomeExibicao}</strong>`
    : 'A sessão terminou sem escolhas registradas.';

  el.areaHistoria.innerHTML = `
    <header class="carta-cabecalho">
      <p class="carta-fase">${carta.fase}</p>
      <h2>${carta.titulo}</h2>
      <div class="filete">◆</div>
      <p class="carta-momento">${carta.momento}</p>
    </header>

    ${carta.texto ? `<div class="carta-texto">${carta.texto}</div>` : ''}

    <div class="caminho-final">
      <p class="caminho-rotulo">Caminho filosófico da sessão</p>
      <div class="caminho-lista">${itens}</div>
      <div class="placar">${placar}</div>
      <p class="caminho-resumo">${resumo}</p>
    </div>

    ${carta.citacaoFinal ? `<p class="citacao-final">“${carta.citacaoFinal}”</p>` : ''}
  `;
  el.areaHistoria.dataset.animar = 'sim';

  el.areaEscolhas.innerHTML = '';
  if (local.papel !== 'mestre') {
    const nota = document.createElement('p');
    nota.className = 'nota-espera';
    nota.textContent = 'Aguarde: o Mestre decide se a sessão recomeça.';
    el.areaEscolhas.appendChild(nota);
  }
}

/* -----------------------------------------------------------------------------
 *  MAPA
 * -------------------------------------------------------------------------- */
function atualizarMapa(carta) {
  if (carta.mapa) {
    el.marcador.hidden = false;
    el.marcador.style.top = carta.mapa.top;
    el.marcador.style.left = carta.mapa.left;
    el.mapaLegenda.textContent = `Posição atual do grupo: ${carta.fase}.`;
  } else {
    el.marcador.hidden = true;
    el.mapaLegenda.textContent = 'O grupo ainda não tem posição definida no mapa.';
  }
}

el.btnMapa.addEventListener('click', () => {
  el.modalMapa.hidden = false;
  el.btnFecharMapa.focus();
});

el.btnFecharMapa.addEventListener('click', fecharMapa);

el.modalMapa.addEventListener('click', (evento) => {
  if (evento.target === el.modalMapa) fecharMapa();
});

document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  if (!el.modalConfirma.hidden) fecharConfirma(false);
  else if (!el.modalMapa.hidden) fecharMapa();
});

function fecharMapa() {
  el.modalMapa.hidden = true;
  el.btnMapa.focus();
}
