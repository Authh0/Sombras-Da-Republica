/* =============================================================================
 *  SOMBRAS DA REPUBLICA  --  ARQUIVO DA HISTORIA
 * =============================================================================
 *
 *  ESTE E O UNICO ARQUIVO QUE VOCES PRECISAM EDITAR PARA MUDAR O JOGO.
 *  Nao tem codigo de verdade aqui, so texto. Pode escrever a vontade.
 *
 *  Depois de editar, rode no terminal:
 *
 *      npm run check-historia
 *
 *  Ele confere a historia inteira e avisa se alguma carta aponta para uma
 *  carta que nao existe, se alguma ficou inalcancavel, se algum caminho nao
 *  chega ao final ou se alguma variante de texto ficou pela metade.
 *  SEMPRE rodem isso antes da apresentacao.
 *
 * -----------------------------------------------------------------------------
 *  COMO O MEIO DA HISTORIA RAMIFICA
 * -----------------------------------------------------------------------------
 *  O texto que voces escreveram ("Texto DEFINITIVO do Mestre") tem uma
 *  RESPOSTA propria para cada escolha de cada carta. Entao a ramificacao
 *  funciona assim:
 *
 *      CARTA 1  ->  o grupo vota  ->  RESPOSTA 1A, 1B ou 1C  ->  CARTA 2
 *
 *  A carta de resposta e uma carta de verdade: ela aparece na tela de todo
 *  mundo, mostra a consequencia daquela decisao especifica e so entao leva a
 *  proxima carta. Sao 15 caminhos diferentes pelo meio da historia.
 *
 *  O FINAL E UNICO. Todos os caminhos chegam na mesma carta final. O que fica
 *  registrado e o caminho filosofico percorrido, mostrado no encerramento.
 *
 * -----------------------------------------------------------------------------
 *  AS VARIANTES POR TENDENCIA (opcional, ainda vazias)
 * -----------------------------------------------------------------------------
 *  Alem das respostas acima, o jogo soma as escolhas e sabe qual filosofo esta
 *  dominando a sessao. Se voces quiserem que o TEXTO DA PROPRIA CARTA tambem
 *  mude conforme essa tendencia, e so preencher o bloco "variantes".
 *
 *  Campo vazio cai no texto base. O jogo nunca quebra por falta de texto.
 * ========================================================================== */

/* -----------------------------------------------------------------------------
 *  OS TRES FILOSOFOS
 * -------------------------------------------------------------------------- */
export const FILOSOFOS = {
  aristoteles: {
    id: 'aristoteles',
    nome: 'Aristoteles',
    nomeExibicao: 'Aristóteles',
    cor: '#c9a227',
    lema: 'A prudência é encontrar a medida certa entre os extremos.',
    resumo: 'Prudência e equilíbrio: evitar os extremos e buscar o caminho mais moderado.',
  },
  kant: {
    id: 'kant',
    nome: 'Kant',
    nomeExibicao: 'Kant',
    cor: '#4a7fb5',
    lema: 'A verdade deve ser defendida mesmo quando o momento é difícil.',
    resumo: 'Dever moral: fazer o que é correto, mesmo que traga consequências negativas.',
  },
  maquiavel: {
    id: 'maquiavel',
    nome: 'Maquiavel',
    nomeExibicao: 'Maquiavel',
    cor: '#a52020',
    lema: 'O poder não espera quem hesita.',
    resumo: 'Estratégia política: alcançar resultados eficazes e manter o controle da situação.',
  },
};

/* Por onde a sessao comeca e onde ela termina. */
export const CENA_INICIAL = 'prologo';
export const CENA_FINAL = 'final';

/* -----------------------------------------------------------------------------
 *  AS CARTAS
 * -----------------------------------------------------------------------------
 *  Campos de cada carta:
 *
 *    fase      -> nome curto que aparece no painel de status e no mapa
 *    tipo      -> 'cena' (padrao) ou 'consequencia' (as cartas de resposta)
 *    filosofo  -> so nas consequencias: pinta o selo com a cor do filosofo
 *    titulo    -> titulo grande da carta
 *    momento   -> linha em italico logo abaixo do titulo
 *    texto     -> corpo da carta (aceita HTML simples: <br>, <b>, <i>)
 *    pergunta  -> a pergunta em destaque, na caixa com bordas vermelhas
 *    narracao  -> OPCIONAL. O que o Mestre le em voz alta, quando isso precisa
 *                 ser diferente do que aparece na tela (ordem ou corte). Se
 *                 ficar de fora, o roteiro e montado sozinho a partir de
 *                 momento + texto + pergunta.
 *    mapa      -> posicao do marcador no mapa tatico (ou null para esconder)
 *    variantes -> versoes alternativas do texto por tendencia (opcional)
 *    escolhas  -> as opcoes de voto
 *
 *  Campos de cada escolha:
 *
 *    id       -> letra da opcao ('a', 'b', 'c')
 *    filosofo -> 'aristoteles', 'kant', 'maquiavel' ou null (nao conta ponto)
 *    titulo   -> o que aparece em negrito no botao
 *    citacao  -> a frase em italico
 *    desc     -> a explicacao embaixo
 *    destino  -> id da proxima carta (TEM que existir neste arquivo)
 * -------------------------------------------------------------------------- */
export const cartas = {
  /* ========================================================================= *
   *  PROLOGO
   * ========================================================================= */
  prologo: {
    fase: 'O Tabuleiro',
    titulo: 'As Sombras do Império',
    momento: 'Rio de Janeiro, 1889.',
    mapa: null,
    texto: `O Império do Brasil está enfraquecido. A monarquia ainda existe, mas sua base política já não é sólida. Militares, elites agrárias, coronéis e grupos urbanos começam a disputar espaço e influência. Por fora, a ordem continua; por dentro, o poder já está sendo negociado.<br><br>
Neste momento, a questão não é apenas se o regime vai mudar. A questão é quem vai se beneficiar dessa mudança. Em um país marcado por interesses, favores e controle local, cada decisão pode fortalecer um grupo e enfraquecer outro.<br><br>
Vocês estão no centro dessa disputa. A História ainda não decidiu como vai lembrar esses dias, e cada escolha pode aproximar o Brasil de uma República de interesses.`,
    pergunta: null,
    variantes: {},
    escolhas: [
      {
        id: 'a',
        filosofo: null,
        titulo: 'Começar a sessão',
        citacao: null,
        desc: null,
        destino: 'abertura',
      },
    ],
  },

  /* ========================================================================= *
   *  ABERTURA  (o "INICIO POS PROLOGO" do texto do Mestre)
   * ========================================================================= */
  abertura: {
    fase: 'O Tabuleiro',
    titulo: 'A Disputa de Interesses',
    momento: 'A crise deixa de ser apenas a queda de um regime e passa a ser uma disputa por interesses.',
    mapa: null,
    texto: `O Império enfraquece, mas isso não significa que todos desejem o mesmo futuro. Uns querem proteger privilégios antigos. Outros querem acelerar a mudança para assumir o controle do que vem depois. Há quem veja a República como esperança, mas também há quem a enxergue apenas como uma nova forma de manter o poder nas mesmas mãos.<br><br>
No Brasil do fim do século XIX, a política não era feita só de ideias. Ela também era feita de alianças, favores, medo, influência e vantagens. A República nasce nesse ambiente: uma mudança histórica que, ao mesmo tempo em que promete renovação, esconde disputas intensas entre militares, elites, coronéis e grupos que não queriam perder espaço.`,
    pergunta: 'Agora vocês precisam decidir como agir diante disso.',
    variantes: {},
    escolhas: [
      {
        id: 'a',
        filosofo: null,
        titulo: 'Virar a primeira carta',
        citacao: null,
        desc: null,
        destino: 'carta1',
      },
    ],
  },

  /* ========================================================================= *
   *  CARTA 1
   * ========================================================================= */
  carta1: {
    fase: 'A Faísca',
    titulo: 'Carta 1 — O Apoio ao Movimento',
    momento: 'Um militar influente procura vocês.',
    mapa: { top: '58%', left: '46%' },
    texto: `Ele fala com segurança e diz que o momento de agir chegou. Segundo ele, o Império está fraco demais para continuar, e apenas uma ruptura rápida pode evitar mais caos.<br><br>
Mas apoiar esse movimento significa entrar numa mudança que não nasceu de um consenso, e sim da disputa entre grupos que querem controlar o futuro.`,
    pergunta:
      'A pergunta agora é simples, mas pesada: vocês vão apoiar a derrubada da monarquia ou recusar participar dessa movimentação?',
    variantes: {},
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Apoiar com equilíbrio',
        citacao: 'A prudência é encontrar a medida certa entre os extremos.',
        desc: 'Você aceita dialogar com o oficial, mas busca agir com cautela. A mudança precisa acontecer de forma equilibrada e sem excessos.',
        destino: 'r1a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Recusar por dever e princípio',
        citacao: 'A verdade deve ser defendida mesmo quando o momento é difícil.',
        desc: 'Você avalia a proposta com base em princípios morais. O mais importante é agir corretamente, independentemente das vantagens políticas.',
        destino: 'r1b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Apoiar pela eficiência da crise',
        citacao: 'Quando o tempo aperta, a astúcia pesa mais que a delicadeza.',
        desc: 'Você acredita que momentos de crise exigem decisões rápidas e eficientes. Se a mudança é inevitável, é melhor participar dela.',
        destino: 'r1c',
      },
    ],
  },

  /* ---- consequencias da carta 1 ------------------------------------------ */
  r1a: {
    fase: 'A Faísca',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — O Apoio ao Movimento',
    momento: 'O grupo escolheu a prudência.',
    mapa: { top: '58%', left: '46%' },
    texto: `Vocês entendem que uma mudança política precisa ser pensada com cuidado, porque por trás de cada decisão existem interesses diferentes tentando dominar o país. Não basta derrubar o Império; é preciso observar quem vai se aproveitar disso depois.<br><br>
Por isso, vocês aceitam ouvir o militar, mas tentam agir com prudência. Procuram reduzir os excessos e impedir que a mudança seja usada como simples ferramenta de vantagem para poucos.<br><br>
Essa postura não impede a crise, mas mostra que vocês não querem entregar o país a uma troca de poder sem reflexão.<br><br>
<i>Os dias seguintes deixam claro que nada fica parado por muito tempo. O que era conversa reservada começa a escapar para os corredores, para os jornais e para as ruas.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta2' }],
  },

  r1b: {
    fase: 'A Faísca',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — O Apoio ao Movimento',
    momento: 'O grupo escolheu o dever.',
    mapa: { top: '58%', left: '46%' },
    texto: `Vocês recusam participar de qualquer movimento que dependa de pressão, traição ou oportunismo. Para vocês, uma mudança política só tem valor se puder ser defendida como correta em si mesma. Não importa se o momento é difícil: agir errado continua sendo errado.<br><br>
A recusa incomoda o militar e outros grupos interessados na queda do Império, mas vocês mantêm a posição. Não vale trocar princípio por conveniência.<br><br>
Essa firmeza cria tensão, e a discussão passa para outro ponto: o que o povo vai saber sobre essa crise?<br><br>
<i>A recusa de vocês não encerra a disputa. Pelo contrário: ela torna ainda mais claro que a crise agora também é uma batalha pela informação.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta2' }],
  },

  r1c: {
    fase: 'A Faísca',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — O Apoio ao Movimento',
    momento: 'O grupo escolheu a estratégia.',
    mapa: { top: '58%', left: '46%' },
    texto: `Vocês percebem que a política real não espera pureza. O Império está enfraquecido, os grupos de poder já estão se movendo e hesitar demais pode significar perder a chance de influenciar o futuro.<br><br>
Então vocês aceitam a proposta e pensam em como usar esse momento a favor de seus objetivos.<br><br>
A decisão é pragmática. Vocês entendem que, numa crise como essa, quem não age acaba sendo guiado pelos interesses dos outros.<br><br>
<i>Agora a cidade começa a ouvir rumores. A disputa sai dos bastidores e começa a aparecer nas ruas.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta2' }],
  },

  /* ========================================================================= *
   *  CARTA 2
   * ========================================================================= */
  carta2: {
    fase: 'O Baile',
    titulo: 'Carta 2 — O Que Contar ao Povo',
    momento: 'A decisão de apoiar ou rejeitar o movimento já começou a espalhar efeitos.',
    mapa: { top: '68%', left: '68%' },
    texto: `As pessoas comentam, desconfiam e tentam entender o que está acontecendo. Jornais recebem informações contraditórias. Alguns querem publicar tudo. Outros preferem esperar.<br><br>
Há quem diga que a população precisa saber a verdade imediatamente. Há também quem acredite que divulgar rápido demais pode causar pânico e facilitar o controle da situação por certos grupos.`,
    pergunta:
      'A pergunta agora é: vocês vão contar tudo, dizer apenas parte da verdade ou usar a informação para influenciar o rumo da crise?',
    /* Opcional: texto da carta mudando conforme a tendencia acumulada.
       Deixe '' para usar o texto base acima. */
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Informar com equilíbrio',
        citacao: 'Nem toda verdade precisa ser lançada sem medida.',
        desc: 'Você procura divulgar as informações de maneira responsável, evitando tanto o pânico quanto a omissão.',
        destino: 'r2a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Contar toda a verdade',
        citacao: 'A verdade não deve ser escondida por conveniência.',
        desc: 'Você acredita que a população tem o direito de saber exatamente o que está acontecendo, sem distorções.',
        destino: 'r2b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Controlar a informação',
        citacao: 'A informação pode ser uma ferramenta de poder.',
        desc: 'Você decide divulgar apenas o que for útil para conduzir a crise na direção desejada.',
        destino: 'r2c',
      },
    ],
  },

  /* ---- consequencias da carta 2 ------------------------------------------ */
  r2a: {
    fase: 'O Baile',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — O Que Contar ao Povo',
    momento: 'O grupo escolheu a medida certa.',
    mapa: { top: '68%', left: '68%' },
    texto: `Vocês procuram um meio seguro de lidar com a situação. Não querem mentir, mas também não querem jogar o país no caos sem necessidade. Então tentam organizar a informação de forma equilibrada, evitando exageros e pensando no menor dano possível.<br><br>
Essa escolha mostra que vocês percebem que até a verdade pode ser usada como instrumento de interesse. Por isso, o jeito de apresentar a informação também importa.<br><br>
Enquanto isso, a cidade continua avançando em direção ao momento decisivo.<br><br>
<i>A crise não está mais escondida. Agora ela circula em voz alta, e cada palavra dita pode mudar o rumo dos acontecimentos.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta3' }],
  },

  r2b: {
    fase: 'O Baile',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — O Que Contar ao Povo',
    momento: 'O grupo escolheu a verdade sem cálculo.',
    mapa: { top: '68%', left: '68%' },
    texto: `Vocês defendem que a verdade não pode ser manipulada. Se a população precisa saber o que está acontecendo, então ela deve saber de forma limpa, sem distorções. Mesmo que isso cause choque ou acelere a instabilidade, mentir seria pior.<br><br>
A decisão é dura, mas clara. Vocês não aceitam tratar as pessoas como ferramenta política. O dever de dizer a verdade vem antes de qualquer cálculo sobre vantagem imediata.<br><br>
A cidade reage ao que foi revelado. Agora fica mais difícil esconder os interesses por trás da crise.<br><br>
<i>A partir daqui, já não basta falar em mudança. Agora todos precisam encarar o que essa mudança realmente significa.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta3' }],
  },

  r2c: {
    fase: 'O Baile',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — O Que Contar ao Povo',
    momento: 'O grupo escolheu controlar a narrativa.',
    mapa: { top: '68%', left: '68%' },
    texto: `Vocês entendem que a informação é uma ferramenta poderosa demais para ser deixada ao acaso. Em vez de apenas divulgar ou esconder, vocês decidem controlar o momento e o efeito da notícia.<br><br>
Talvez isso sirva para pressionar alguém. Talvez sirva para proteger um lado. Talvez sirva para preparar o terreno para a mudança.<br><br>
A atitude é estratégica. Vocês percebem que controlar a narrativa também é uma forma de controlar o poder.<br><br>
<i>O país entra numa fase ainda mais instável. Agora já não se trata só de apoiar ou não uma mudança, mas de decidir quem vai se beneficiar dela.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta3' }],
  },

  /* ========================================================================= *
   *  CARTA 3
   * ========================================================================= */
  carta3: {
    fase: 'A Conspiração',
    titulo: 'Carta 3 — Quem Vai Se Beneficiar',
    momento: 'A queda do Império já parece próxima.',
    mapa: { top: '25%', left: '68%' },
    texto: `O problema é que nem todos querem a mesma República. Alguns desejam ordem. Outros desejam liberdade. Outros querem apenas manter poder e influência, mudando o nome do regime sem mudar a estrutura por trás dele.<br><br>
Vocês percebem que a crise não é apenas sobre derrubar a monarquia. É sobre quem vai ocupar o espaço deixado por ela.`,
    pergunta:
      'Agora surge uma nova decisão: vocês vão buscar equilíbrio entre os lados, expor todas as intenções ou usar a mudança para garantir vantagem?',
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Buscar o bem comum e evitar extremos',
        citacao: 'A melhor decisão é aquela que reduz o dano e preserva a cidade.',
        desc: 'Você tenta impedir a mentira, mas também evita transformar a crise em uma guerra aberta. A saída ideal é a mais prudente.',
        destino: 'r3a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Expor a verdade sem esconder nada',
        citacao: 'A verdade não deve ser usada como ferramenta; ela deve ser respeitada.',
        desc: 'Você decide revelar tudo ao público, mesmo sabendo que isso pode causar desordem e acelerar o conflito.',
        destino: 'r3b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Usar a informação para vencer a disputa',
        citacao: 'Num momento de crise, quem controla a informação controla o destino.',
        desc: 'Você permite ou manipula a divulgação para garantir que seu lado saia fortalecido, mesmo que isso custe a verdade.',
        destino: 'r3c',
      },
    ],
  },

  /* ---- consequencias da carta 3 ------------------------------------------ */
  r3a: {
    fase: 'A Conspiração',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — Quem Vai Se Beneficiar',
    momento: 'O grupo tentou impedir outro extremo.',
    mapa: { top: '25%', left: '68%' },
    texto: `Vocês tentam evitar que o país caia em outro extremo. A mudança precisa acontecer, mas sem virar um terreno de dominação total de um único grupo.<br><br>
Em vez de alimentar a disputa mais agressiva, vocês tentam reduzir os danos e buscar um caminho mais justo para todos.<br><br>
Essa postura não resolve tudo, mas impede que a crise se transforme em uma troca de poder sem controle. Vocês entendem que governar também é impedir que os interesses destruam o bem comum.<br><br>
<i>A República começa a tomar forma, mas ainda sem mostrar com clareza quem realmente vai comandá-la.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta4' }],
  },

  r3b: {
    fase: 'A Conspiração',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — Quem Vai Se Beneficiar',
    momento: 'O grupo escolheu a sinceridade total.',
    mapa: { top: '25%', left: '68%' },
    texto: `Vocês decidem enfrentar a situação com sinceridade total. Se há interesses escondidos, eles devem ser revelados. Se há manipulação, ela deve ser exposta. Se há acordos secretos, ninguém deve fingir que não viu.<br><br>
A verdade, porém, cobra um preço. Ao revelar tudo, vocês abalam alianças, enfraquecem certezas e tornam impossível esconder o que estava acontecendo.<br><br>
A tensão cresce, mas o princípio permanece intacto: não se constrói justiça sobre mentira.<br><br>
<i>A partir desse ponto, a crise deixa de ser apenas política. Ela se torna também moral.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta4' }],
  },

  r3c: {
    fase: 'A Conspiração',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — Quem Vai Se Beneficiar',
    momento: 'O grupo escolheu agir com cálculo.',
    mapa: { top: '25%', left: '68%' },
    texto: `Vocês escolhem agir com cálculo. Se a República vai nascer, então é melhor que ela nasça sob uma direção que vocês consideram favorável.<br><br>
A crise deixa de ser apenas um problema e passa a ser uma oportunidade de conduzir o futuro.<br><br>
Essa decisão mostra que, em tempos de mudança, quem hesita perde espaço. Vocês passam a pensar não só no que é certo ou prudente, mas no que é eficaz para moldar o resultado.<br><br>
<i>O país está prestes a mudar de vez. Falta apenas decidir como vocês vão chegar ao fim disso.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta4' }],
  },

  /* ========================================================================= *
   *  CARTA 4
   * ========================================================================= */
  carta4: {
    fase: 'O Dia 15',
    titulo: 'Carta 4 — O Nascimento da Nova Ordem',
    momento: 'Chega 15 de novembro de 1889.',
    mapa: { top: '40%', left: '50%' },
    texto: `As tropas se movem, os boatos aumentam e o Império finalmente cede. A República está prestes a ser proclamada.<br><br>
Vocês estão diante do desfecho. O que fizerem agora vai definir não só o fato histórico em si, mas também a forma como esse novo Brasil vai ser organizado e dominado.`,
    pergunta:
      'Mas mesmo no instante final, a pergunta continua de pé: o que vale mais, a prudência, o dever ou a estratégia?',
    /* O documento do Mestre traz a pergunta NO MEIO desta carta, e a tela a
       mostra no fim, na caixa destacada. Para o Mestre nao ler fora de ordem,
       a narracao dele e escrita aqui na ordem do documento original. */
    narracao: `Chega 15 de novembro de 1889.<br><br>
As tropas se movem, os boatos aumentam e o Império finalmente cede. A República está prestes a ser proclamada. Mas mesmo no instante final, a pergunta continua de pé: o que vale mais, a prudência, o dever ou a estratégia?<br><br>
Vocês estão diante do desfecho. O que fizerem agora vai definir não só o fato histórico em si, mas também a forma como esse novo Brasil vai ser organizado e dominado.`,
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Guiar o país com prudência',
        citacao: 'A virtude política está em evitar os excessos.',
        desc: 'Você tenta reduzir os danos, unir grupos diferentes e escolher a saída mais equilibrada para o país.',
        destino: 'r4a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Agir pelo dever e pela verdade',
        citacao: 'A dignidade da ação está em seguir o princípio correto.',
        desc: 'Você defende que a decisão final precisa ser moralmente justa, mesmo que o resultado seja difícil.',
        destino: 'r4b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Garantir a vitória custe o que custar',
        citacao: 'O poder não espera quem hesita.',
        desc: 'Você escolhe a solução mais eficiente para vencer a disputa política e manter o controle da situação.',
        destino: 'r4c',
      },
    ],
  },

  /* ---- consequencias da carta 4 ------------------------------------------ */
  r4a: {
    fase: 'O Dia 15',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — O Nascimento da Nova Ordem',
    momento: 'A nova ordem nasce sob a prudência.',
    mapa: { top: '40%', left: '50%' },
    texto: `Vocês escolhem o caminho do equilíbrio. O país precisa mudar, mas não precisa se destruir nessa mudança. Em vez de alimentar o caos, vocês tentam dar ao novo tempo um começo menos violento, mais racional e mais estável.<br><br>
A escolha de vocês mostra que a política pode ser feita com cuidado. Não existe solução perfeita, mas existe a tentativa de reduzir os extremos e limitar os abusos.<br><br>
<i>A nova ordem nasce com a ideia de que prudência também é força.</i><br><br>
Com a queda da monarquia, o problema não termina. Na verdade, ele apenas muda de forma.`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta5' }],
  },

  r4b: {
    fase: 'O Dia 15',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — O Nascimento da Nova Ordem',
    momento: 'A nova ordem nasce sob o dever.',
    mapa: { top: '40%', left: '50%' },
    texto: `Vocês insistem que a decisão final precisa ser moralmente correta. Mesmo que o momento seja difícil, vocês não abandonam o dever. O importante é não trair aquilo que consideram justo, especialmente quando o poder costuma favorecer poucos.<br><br>
Essa postura pode parecer rígida, mas é o que impede que a mudança vire apenas continuação da dominação antiga.<br><br>
Vocês deixam claro que nem todo resultado vale qualquer método.<br><br>
<i>A República nasce, mas vocês não aceitam que ela se sustente sobre atalhos morais.</i><br><br>
Com a queda da monarquia, o problema não termina. Na verdade, ele apenas muda de forma.`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta5' }],
  },

  r4c: {
    fase: 'O Dia 15',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — O Nascimento da Nova Ordem',
    momento: 'A nova ordem nasce sob o cálculo.',
    mapa: { top: '40%', left: '50%' },
    texto: `Vocês escolhem a eficiência. O país precisa de direção, e hesitar pode custar tudo. Então vocês aceitam que a mudança política também é uma disputa de poder, e que vencer essa disputa é a única forma de garantir o novo cenário.<br><br>
A escolha é dura, mas coerente com a lógica da crise. Vocês fazem o necessário para que o lado de vocês prevaleça.<br><br>
<i>A República nasce sob cálculo, interesse e decisão. E é exatamente isso que torna esse momento histórico tão humano.</i><br><br>
Com a queda da monarquia, o problema não termina. Na verdade, ele apenas muda de forma.`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta5' }],
  },

  /* ========================================================================= *
   *  CARTA 5
   * ========================================================================= */
  carta5: {
    fase: 'Os Interesses',
    titulo: 'Carta 5 — A República dos Interesses',
    momento: 'A República já foi proclamada, mas o jogo do poder está longe de terminar.',
    mapa: { top: '62%', left: '34%' },
    texto: `Agora o foco se desloca para o interior, para os coronéis, para os acordos locais e para o controle do voto. Em muitos lugares, a mudança no nome do regime não muda a vida de quem trabalha, de quem obedece e de quem depende dos grandes proprietários.`,
    pergunta:
      'A nova pergunta é: essa República vai servir ao povo ou vai continuar sendo guiada pelos interesses de poucos?',
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Defender limites ao poder local',
        citacao: 'Uma República só é justa quando reduz os abusos.',
        desc: 'Você tenta impedir que a nova ordem repita a lógica da velha dominação e busca uma organização mais equilibrada.',
        destino: 'r5a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Denunciar a manipulação dos poderosos',
        citacao: 'Sem verdade, a justiça vira aparência.',
        desc: 'Você expõe a lógica de favores, coerção e controle que sustenta a nova ordem.',
        destino: 'r5b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Entrar no jogo para sobreviver',
        citacao: 'Quem não participa do jogo, é excluído por ele.',
        desc: 'Você aceita a realidade do sistema e passa a agir dentro dele para manter influência e poder.',
        destino: 'r5c',
      },
    ],
  },

  /* ---- consequencias da carta 5 ------------------------------------------ */
  r5a: {
    fase: 'Os Interesses',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — A República dos Interesses',
    momento: 'O grupo cobrou limites ao poder local.',
    mapa: { top: '62%', left: '34%' },
    texto: `Vocês percebem que uma República de verdade precisa limitar os abusos locais e impedir que o poder continue concentrado nas mesmas mãos. Não basta mudar o regime se os mecanismos de dominação continuarem funcionando do mesmo jeito.<br><br>
Por isso, vocês tentam defender uma organização mais justa, em que o país não seja apenas dividido entre manda-chuvas e dependentes.<br><br>
Essa atitude mostra que a mudança só vale se atingir também a estrutura do poder.<br><br>
<i>A República, para vocês, só faz sentido se trouxer algum equilíbrio real.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Ver o desfecho', citacao: null, desc: null, destino: 'final' }],
  },

  r5b: {
    fase: 'Os Interesses',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — A República dos Interesses',
    momento: 'O grupo denunciou a lógica da nova ordem.',
    mapa: { top: '62%', left: '34%' },
    texto: `Vocês decidem denunciar a lógica por trás da nova ordem. Se a República está nascendo, mas continua baseada em favores, coerção e controle, então alguém precisa dizer isso em voz alta.<br><br>
A denúncia causa desconforto, porque mexe com interesses fortes. Mas vocês mantêm a posição: não existe liberdade verdadeira se o poder continua sendo usado para manipular pessoas e territórios.<br><br>
A crise deixa de ser só uma mudança de governo e passa a ser também uma disputa sobre legitimidade.<br><br>
<i>Vocês mostram que uma nova ordem não se sustenta apenas com nomes novos. Ela precisa enfrentar os vícios antigos.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Ver o desfecho', citacao: null, desc: null, destino: 'final' }],
  },

  r5c: {
    fase: 'Os Interesses',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — A República dos Interesses',
    momento: 'O grupo entrou no jogo do novo sistema.',
    mapa: { top: '62%', left: '34%' },
    texto: `Vocês escolhem entrar no novo sistema da forma mais eficiente possível. Se o poder agora depende de alianças locais, então vocês constroem alianças. Se o voto é controlado por interesses, vocês aprendem a jogar esse jogo.<br><br>
A decisão é pragmática. Vocês não ignoram a realidade: numa República de interesses, quem recusa o jogo pode acabar fora dele.<br><br>
Isso mostra que o novo regime nasce com promessas, mas também com velhas estruturas de influência.<br><br>
<i>A República muda de forma, mas não abandona de imediato sua lógica de poder.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Ver o desfecho', citacao: null, desc: null, destino: 'final' }],
  },

  /* =========================================================================
   *  O FINAL E UNICO. Todos os caminhos chegam aqui, com o mesmo texto.
   *  O que muda e o registro do caminho percorrido, montado pelo jogo.
   * ====================================================================== */
  final: {
    fase: 'O Legado',
    titulo: 'Fim de Jogo',
    momento: 'No fim, o Brasil mudou.',
    mapa: null,
    texto: `A monarquia caiu, a República surgiu e o país entrou em uma nova fase. Mas a história que vocês viveram mostra algo importante: essa mudança não foi apenas uma troca de governo.<br><br>
<b>Ela foi uma disputa de interesses.</b><br><br>
Cada decisão revelou quem queria prudência, quem queria princípio, quem queria vantagem e quem queria apenas continuar mandando. A República nasceu, mas não nasceu pura. Ela também foi moldada por alianças, controle e pela luta para definir quem teria voz no novo país.`,
    pergunta: null,
    variantes: {},
    citacaoFinal:
      'A grande lição desta experiência é que a História não é feita só de datas e fatos. Ela é feita de escolhas, conflitos e disputas por poder.',
    escolhas: [],
  },
};
