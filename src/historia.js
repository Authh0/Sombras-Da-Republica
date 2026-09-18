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
 *  QUEM SAO OS JOGADORES
 * -----------------------------------------------------------------------------
 *  A turma e a redacao de "O Ouvidor", um jornal pequeno da Rua do Ouvidor, no
 *  Rio de Janeiro, em 1889. Eles nao derrubam o Imperio e nao proclamam nada.
 *  Eles decidem o que sai impresso -- que e o unico poder que um jornal tem, e
 *  e mais poder do que parece.
 *
 *  O jornal e ficticio de proposito. Colocar decisoes inventadas na boca de um
 *  jornal que existiu de verdade (a Gazeta de Noticias, o Jornal do Commercio,
 *  O Paiz, a Cidade do Rio) seria falsificar a historia deles. A rua, as datas,
 *  os nomes publicos e os documentos sao reais; a redacao e nossa.
 *
 * -----------------------------------------------------------------------------
 *  AS CITACOES  --  LEIA ANTES DE MEXER
 * -----------------------------------------------------------------------------
 *  Ha QUATRO citacoes reais no arquivo, todas com a fonte indicada logo depois:
 *
 *    - as tres da carta "abertura" (Aristoteles, Kant e Maquiavel);
 *    - a frase de Aristides Lobo, na "carta5".
 *
 *  NAO invente citacao nova e NAO mexa nessas quatro. E o que separa um
 *  trabalho de Filosofia de uma colagem de frase de internet, e ha teste
 *  automatico guardando as tres da abertura (tools/teste-regras.js).
 *
 *  As outras aspas do arquivo NAO sao citacao de filosofo: sao chamadas de
 *  primeira pagina ("REPUBLICA", "GOLPE"), fala de personagem ficticio e
 *  palavra posta em destaque. Pode editar essas a vontade.
 *
 * -----------------------------------------------------------------------------
 *  UMA SIMPLIFICACAO ASSUMIDA: "PRIMEIRA PAGINA"
 * -----------------------------------------------------------------------------
 *  Jornal brasileiro de 1889 nao tinha manchete. A primeira pagina era coluna
 *  de tipo miudo: folhetim, artigo de fundo, secoes fixas e anuncio. Titulo
 *  grande atravessando colunas so vira pratica corrente por volta de 1905.
 *
 *  O jogo fala em "alto da primeira coluna" e "corpo de cartaz", que e o que
 *  de fato dava para fazer. Se o professor perguntar, a resposta e essa -- e
 *  ela conta ponto, porque mostra que voces sabiam.
 * ========================================================================== */

/* -----------------------------------------------------------------------------
 *  OS TRES FILOSOFOS
 *
 *  O campo "lema" e parafrase, nao citacao. Nao coloque aspas nele.
 * -------------------------------------------------------------------------- */
export const FILOSOFOS = {
  aristoteles: {
    id: 'aristoteles',
    nome: 'Aristoteles',
    nomeExibicao: 'Aristóteles',
    cor: '#c9a227',
    lema: 'A medida certa não é a média: é o que aquela situação exige.',
    resumo:
      'Prudência prática (phronesis): julgar este caso, agora, com o que se tem — sem cair no excesso, sem cair na falta e sem fugir da decisão.',
  },
  kant: {
    id: 'kant',
    nome: 'Kant',
    nomeExibicao: 'Kant',
    cor: '#4a7fb5',
    lema: 'Aja só segundo uma regra que você possa querer que valha para todos.',
    resumo:
      'Dever moral: existe o que é certo, e ele não deixa de ser certo porque sai caro. Pessoas são fim, nunca só meio.',
  },
  maquiavel: {
    id: 'maquiavel',
    nome: 'Maquiavel',
    nomeExibicao: 'Maquiavel',
    cor: '#a52020',
    lema: 'Quem parte do mundo como ele deveria ser costuma perder para quem parte do mundo como ele é.',
    resumo:
      'Eficácia política: quem é derrubado não muda nada. Cuidar primeiro de sobreviver e de conseguir resultado — inclusive quando quem precisa sobreviver é uma república livre.',
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
 *    fase      -> nome curto que aparece no painel de status e na trilha
 *    tipo      -> 'cena' (padrao) ou 'consequencia' (as cartas de resposta)
 *    filosofo  -> so nas consequencias: pinta o selo com a cor do filosofo
 *    titulo    -> titulo grande da carta
 *    momento   -> linha em italico logo abaixo do titulo
 *    texto     -> corpo da carta (aceita HTML simples: <br>, <b>, <i>)
 *    pergunta  -> a pergunta em destaque, na caixa com bordas vermelhas
 *    narracao  -> OPCIONAL. So use quando o que o Mestre le precisa estar em
 *                 ordem diferente da tela. Nesta versao nenhuma carta precisa.
 *    mapa      -> posicao do marcador no mapa (ou null para esconder)
 *    variantes -> versoes alternativas do texto por tendencia (opcional)
 *    escolhas  -> as opcoes de voto
 *
 *  Campos de cada escolha:
 *
 *    id       -> letra da opcao ('a', 'b', 'c')
 *    filosofo -> 'aristoteles', 'kant', 'maquiavel' ou null (nao conta ponto)
 *    titulo   -> o que aparece em negrito no botao
 *    citacao  -> a frase em italico (parafrase, nunca citacao real)
 *    desc     -> UMA linha dizendo o que sai impresso. NAO defenda a opcao:
 *                o argumento e da turma, nao do jogo. Se o desc convence, a
 *                sala para de discutir e so escolhe a frase mais bonita.
 *    destino  -> id da proxima carta (TEM que existir neste arquivo)
 *
 *  SOBRE O MAPA: toda a historia acontece dentro do Rio, entao o mapa regional
 *  antigo nao ajuda mais e esta com "mapa: null" em todas as cartas. Se voces
 *  trocarem a imagem por uma planta do Rio de 1888-1889, da para voltar a
 *  marcar: Campo de Santana, Rua do Ouvidor, Camara Municipal e o Cais
 *  Pharoux, de onde a familia imperial partiu.
 * -------------------------------------------------------------------------- */
export const cartas = {
  /* ========================================================================= *
   *  PROLOGO
   * ========================================================================= */
  prologo: {
    fase: 'A Redação',
    titulo: 'A Rua do Ouvidor',
    momento: 'Rio de Janeiro, 1889. Quatro quarteirões onde o Brasil fica sabendo das coisas.',
    mapa: null,
    texto: `A Rua do Ouvidor tem cafés, livrarias, chapelarias e jornal — muito jornal. Quem quer espalhar um boato entra aqui de manhã. À tarde, o boato já virou notícia no resto do país.<br><br>
Num sobrado que range, funciona <b>O Ouvidor</b>: quatro páginas, uma prensa velha e uma tiragem que não assusta ninguém. Vocês são a redação. Não têm dinheiro, não têm padrinho e, por isso mesmo, ainda têm a única coisa que os jornais grandes venderam faz tempo — a liberdade de escolher o que sai no alto da primeira coluna.<br><br>
O Império está rachando. Nos próximos meses, cinco decisões vão passar por esta mesa. Nenhuma delas é sobre quem vai governar o Brasil. Todas são sobre o que vocês vão imprimir.`,
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
   *  ABERTURA  --  as tres vozes, com as tres citacoes reais
   * ========================================================================= */
  abertura: {
    fase: 'A Redação',
    titulo: 'Três Vozes na Mesa',
    momento: 'Antes de virar a primeira carta, três mortos entram na discussão.',
    mapa: null,
    texto: `Toda redação tem aquela briga que nunca termina: até onde vai a verdade e onde começa o estrago. Para não repetir a briga cinco vezes, vamos dar nome a ela.<br><br>
<b>Aristóteles</b> diria que a virtude está no meio-termo — e cuidado, meio-termo não é média nem é ficar em cima do muro. É a medida certa para <i>aquela</i> situação, e quem julga é a prudência, a <i>phronesis</i>. Ele avisa que a parte difícil é acertar: <i>"qualquer um pode encolerizar-se, dar ou gastar dinheiro — isso é fácil; mas fazê-lo à pessoa que convém, na medida, na ocasião, pelo motivo e da maneira que convém, eis o que não é para qualquer um."</i> (Ética a Nicômaco, Livro II, capítulo 9).<br><br>
<b>Kant</b> diria que com o dever não se negocia: <i>"Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne lei universal."</i> (Fundamentação da Metafísica dos Costumes). Se mentir é útil hoje, mentir virou lei — e aí acabou o jornalismo.<br><br>
<b>Maquiavel</b> diria que os dois estão descrevendo um mundo que não existe: <i>"há tanta diferença de como se vive e como se deveria viver, que aquele que abandone o que se faz por aquilo que se deveria fazer, aprenderá antes o caminho de sua ruína do que o de sua preservação."</i> (O Príncipe, capítulo XV). Jornal fechado não informa ninguém.`,
    pergunta: 'Guardem as três vozes. Nenhuma delas é a vilã — e a primeira carta já está na mesa.',
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
   *  CARTA 1  --  a Abolicao, um ano depois
   * ========================================================================= */
  carta1: {
    fase: 'A Herança',
    titulo: 'Carta 1 — O Ano Depois da Lei',
    momento: 'Maio de 1889. Faz um ano que a escravidão acabou no papel.',
    mapa: null,
    texto: `Duas pessoas procuraram o jornal na mesma semana. As duas estão dizendo a verdade.<br><br>
Uma é um fazendeiro do Vale do Paraíba. Perdeu de um dia para o outro tudo o que chamava de patrimônio, sem um mil-réis de indenização, e hoje fala em República. Traz escrituras, nomes e números, e tudo o que ele quer publicado dá para conferir. Traz também anúncios pagos por seis meses — e a redação está devendo o papel.<br><br>
A outra é uma mulher liberta que trabalha três casas abaixo. Diz que a lei acabou com a escravidão e não acabou com mais nada: sem terra, sem salário que dê para viver, sem escola para os filhos, e o mesmo capataz de antes agora se chamando patrão. Ela não tem documento nenhum. Tem a própria história e a de mais trinta pessoas dispostas a falar — e publicar isso é pedir ao leitor que acredite em trinta pessoas.`,
    pergunta: 'O espaço nobre do jornal é um só, e o anúncio está em cima da mesa. O que vocês fazem?',
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'As duas, com peso diferente',
        citacao: 'Não é dividir ao meio: é dar a cada versão o que as provas dela bancam.',
        desc: 'Aceitar o anúncio e ainda assim dividir a página entre as duas histórias, dizendo qual tem papel e qual tem testemunha.',
        destino: 'r1a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Recusar o dinheiro, publicar os libertos',
        citacao: 'Jornal que vende cobertura deixa de ser jornal.',
        desc: 'Devolver o anúncio e dar a página inteira às trinta pessoas.',
        destino: 'r1b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Aceitar o anúncio e publicar o fazendeiro',
        citacao: 'Jornal que fecha não publica mais nada, nunca mais.',
        desc: 'Seis meses de caixa garantido e a história dela marcada para depois.',
        destino: 'r1c',
      },
    ],
  },

  /* ---- consequencias da carta 1 ------------------------------------------ */
  r1a: {
    fase: 'A Herança',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — O Ano Depois da Lei',
    momento: 'O grupo escolheu a prudência.',
    mapa: null,
    texto: `As duas histórias saem na mesma página, e a página deixa explícito o que é escritura e o que é depoimento. Vocês não fingiram que as duas dores pesam igual, e também não apagaram nenhuma.<br><br>
O fazendeiro cancela metade dos anúncios: diz que pagou para ser ouvido, não para dividir espaço. A liberta manda avisar que a matéria ficou correta, mas fria. Só que tem uma armadilha aqui: a medida não ficou certa <b>porque</b> os dois reclamaram. Isso seria o velho truque "se irritei os dois lados, acertei", que é a média aritmética vestida de prudência. Ela ficou certa, se ficou, porque cada versão pesou o que as provas dela aguentavam.<br><br>
<i>A conta do papel fecha raspando. E o Império, lá fora, continua rachando.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta2' }],
  },

  r1b: {
    fase: 'A Herança',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — O Ano Depois da Lei',
    momento: 'O grupo escolheu o dever.',
    mapa: null,
    texto: `A página sai inteira para os libertos, com nome e sobrenome de quem falou. O dinheiro do fazendeiro é recusado na frente dele, o que foi um prazer curto e caro.<br><br>
A edição vende como nenhuma outra em dois anos. Três dias depois, o fornecedor de papel passa a exigir pagamento à vista — e duas das trinta pessoas perdem o lugar na semana seguinte. Vocês trataram aquela gente como gente com história própria, e não como argumento de alguém. Elas dirão que ninguém as avisou do preço. As duas coisas são verdade ao mesmo tempo.<br><br>
<i>A prensa continua rodando, por enquanto. E o Império, lá fora, continua rachando.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta2' }],
  },

  r1c: {
    fase: 'A Herança',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — O Ano Depois da Lei',
    momento: 'O grupo escolheu a estratégia.',
    mapa: null,
    texto: `O anúncio é aceito e a matéria do fazendeiro sai no alto da primeira coluna. Bem escrita, honesta dentro do que conta — e silenciosa sobre tudo o que ele preferiu não contar.<br><br>
Pela primeira vez em dois anos, O Ouvidor tem seis meses de caixa garantido. Isso significa uma prensa que ninguém derruba de um dia para o outro. Também significa que a mulher liberta voltou ao trabalho três casas abaixo sem sair no jornal, e que ela viu a página na mão do jornaleiro. A matéria dela fica marcada para depois. "Depois" é uma palavra que envelhece rápido em redação.<br><br>
<i>O caixa está firme. E o Império, lá fora, continua rachando.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta2' }],
  },

  /* ========================================================================= *
   *  CARTA 2  --  a conspiracao militar
   * ========================================================================= */
  carta2: {
    fase: 'O Segredo',
    titulo: 'Carta 2 — O Rapaz Que Falou Demais',
    momento: 'Começo de novembro de 1889. Um aluno da Escola Militar entra pelos fundos.',
    mapa: null,
    texto: `Ele é da Praia Vermelha, não tem vinte e cinco anos e não deveria estar aqui. Fala rápido, olhando para a porta: o Exército vai se mover. Não é conversa de café — ele dá a data aproximada, o lugar e o nome de dois oficiais graduados. Pede uma coisa só: que não o citem. Depois vai embora e não volta mais.<br><br>
Se for verdade, vocês têm em cima da mesa a maior notícia desde a Independência.<br><br>
O Império não censura antes: a Constituição proíbe. Ele cobra depois. O gerente do jornal responde por abuso da liberdade de imprensa e a edição é apreendida na rua. E existe o que ninguém põe no papel: a turba que invade a tipografia e espalha os tipos pelo chão. Chama-se empastelamento e acontece. Se vocês não publicarem nada, amanhã a notícia sai em outro lugar, com outra assinatura.`,
    pergunta: 'A informação está com vocês. Por quanto tempo?',
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Publicar o que o leitor precisa',
        citacao: 'Nem o silêncio nem o estouro: o quanto serve a quem lê.',
        desc: 'Uma nota sobre a tensão nos quartéis, sem data, sem nome e sem o rapaz.',
        destino: 'r2a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'Publicar tudo, assinado',
        citacao: 'A verdade não fica melhor guardada na gaveta.',
        desc: 'A história inteira, com data, nomes e a promessa ao rapaz desfeita.',
        destino: 'r2b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Guardar e escolher a hora',
        citacao: 'Notícia guardada ainda é sua. Publicada, é de todo mundo.',
        desc: 'Nada impresso, e um recado discreto para os dois lados de que vocês sabem.',
        destino: 'r2c',
      },
    ],
  },

  /* ---- consequencias da carta 2 ------------------------------------------ */
  r2a: {
    fase: 'O Segredo',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — O Rapaz Que Falou Demais',
    momento: 'O grupo escolheu a prudência.',
    mapa: null,
    texto: `Sai uma nota discreta na página três: os quartéis estão inquietos, oficiais falam em mudança, o governo faz de conta que não ouve. Nenhum nome, nenhuma data. Nada que quebre a palavra dada ao rapaz.<br><br>
Ninguém prende ninguém. Nenhum jornal repercute. Dez dias depois, ele tinha razão sobre tudo — e vocês tinham publicado dez por cento disso. Foi medida ou foi <b>falta</b>? Aristóteles não deixa responder isso pelo que aconteceu depois. Responde-se pelo que dava para julgar naquela hora, com o que estava na mesa.<br><br>
<i>Guardem a resposta. O dia 15 chega na próxima carta.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta3' }],
  },

  r2b: {
    fase: 'O Segredo',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — O Rapaz Que Falou Demais',
    momento: 'O grupo escolheu o dever.',
    mapa: null,
    texto: `A história sai inteira, assinada, com data e nome. A edição é apreendida na rua e o gerente é chamado a depor. Dois jornais grandes copiam a notícia sem citar a fonte, e um deles ainda escreve que O Ouvidor foi irresponsável.<br><br>
E aqui vem a parte incômoda: é fácil sair desta mesa achando que Kant assinou embaixo. Ele não assinaria. Calar não é mentir — o dever é não afirmar o falso, não é contar tudo o que se sabe. Não havia dever de publicar. Havia uma promessa, e promessa não se desmancha por conveniência. Vocês usaram um rapaz de vinte e poucos anos como meio para informar o país.<br><br>
<i>Dias depois, ele não apareceu mais em lugar nenhum. Vocês não sabem se foi medo ou se foi pior.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta3' }],
  },

  r2c: {
    fase: 'O Segredo',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — O Rapaz Que Falou Demais',
    momento: 'O grupo escolheu a estratégia.',
    mapa: null,
    texto: `A informação vai para a gaveta e um recado discreto circula: O Ouvidor sabe. O efeito é imediato e desconfortável. Um secretário do ministro manda perguntar o que exatamente vocês sabem. Um oficial manda dizer que não esqueceria a gentileza.<br><br>
Em três dias, o jornal passou de espectador a peça no tabuleiro. Maquiavel aprovaria o cálculo e faria uma pergunta incômoda: peça de quem?<br><br>
<i>A notícia continua guardada. O tempo, a partir de agora, anda mais rápido do que a redação.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta3' }],
  },

  /* ========================================================================= *
   *  CARTA 3  --  a manha do dia 15
   *  As tres consequencias desta carta quebram a forma de proposito: dois
   *  paragrafos, sem fecho em italico. E o pico da sessao; corta seco.
   * ========================================================================= */
  carta3: {
    fase: 'A Manhã',
    titulo: 'Carta 3 — A Manhã em Que Ninguém Sabia',
    momento: '15 de novembro de 1889, pouco depois das oito da manhã.',
    mapa: null,
    texto: `Tropa no Campo de Santana. O marechal Deodoro da Fonseca saiu de casa doente e foi até lá assim mesmo. A tropa cercou o Quartel-General, e o ministério do Visconde de Ouro Preto está caindo lá dentro agora.<br><br>
Só que ninguém na rua sabe dizer o que isso é. Derrubaram o gabinete, como já derrubaram tantos outros — ou derrubaram o Império? O telégrafo está nas mãos dos militares. Dom Pedro II está em Petrópolis, e ninguém sabe se já desceu a serra. E o próprio Deodoro, até este momento, não disse a palavra <i>república</i> em lugar nenhum.<br><br>
A edição da tarde fecha ao meio-dia, e o grosso dela já está composto desde a madrugada. O que ainda dá para trocar é o alto da primeira coluna. Para muita gente, aquelas poucas linhas vão ser tudo o que se lê hoje sobre hoje.`,
    pergunta:
      'Ninguém ainda pronunciou essa palavra. O Ouvidor imprime primeiro, ou imprime só o que já está confirmado?',
    variantes: {
      aristoteles: { momento: '', texto: '', pergunta: '' },
      kant: { momento: '', texto: '', pergunta: '' },
      maquiavel: { momento: '', texto: '', pergunta: '' },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: '"O ministério caiu"',
        citacao: 'Dizer o que se viu, e só isso, também é uma decisão.',
        desc: 'O fato confirmado, as duas hipóteses embaixo e a admissão de que ainda é cedo.',
        destino: 'r3a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: '"Não sabemos o que está acontecendo"',
        citacao: 'Fingir certeza é mentir com outra roupa.',
        desc: 'A ignorância do jornal no espaço mais visível, com fato e boato em colunas separadas.',
        destino: 'r3b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: '"República"',
        citacao: 'Quem chega primeiro escolhe a palavra que todos vão repetir.',
        desc: 'Uma palavra em corpo de cartaz, impressa antes de alguém tê-la dito.',
        destino: 'r3c',
      },
    ],
  },

  /* ---- consequencias da carta 3 ------------------------------------------ */
  r3a: {
    fase: 'A Manhã',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — A Manhã em Que Ninguém Sabia',
    momento: 'O grupo escolheu a prudência.',
    mapa: null,
    texto: `"O MINISTÉRIO CAIU." Embaixo, em corpo miúdo, as duas hipóteses e uma frase que poucos jornais imprimiram naquele dia: ainda não é possível afirmar o que vem depois.<br><br>
A edição vende devagar. À noite, quando o desfecho já é público, leitor nenhum pode dizer que O Ouvidor errou. Também ninguém corre para contar que leu aqui primeiro. Prudência quase nunca parece coragem no dia em que é praticada.`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta4' }],
  },

  r3b: {
    fase: 'A Manhã',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — A Manhã em Que Ninguém Sabia',
    momento: 'O grupo escolheu o dever.',
    mapa: null,
    texto: `"NÃO SABEMOS O QUE ESTÁ ACONTECENDO." Em corpo de cartaz. Do lado, duas colunas: <b>o que é fato</b> e <b>o que é boato</b>, com os boatos nomeados um por um.<br><br>
Metade da rua acha uma piada, e quatro assinantes anuais cancelam — um deles escreve que paga jornal para ser informado, não para ser acompanhado na dúvida. Um redator de jornal grande comenta no café que aquilo não é jornalismo, é confissão, e não percebe que acabou de descrever o que faltava na primeira página dele. Ao cair da tarde, nenhum boato precisou ser desmentido, porque nenhum tinha sido afirmado.`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta4' }],
  },

  r3c: {
    fase: 'A Manhã',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — A Manhã em Que Ninguém Sabia',
    momento: 'O grupo escolheu a estratégia.',
    mapa: null,
    texto: `"REPÚBLICA." Uma palavra só, em corpo de cartaz, impressa quando ainda era aposta. Durante quatro horas, foi a coisa mais irresponsável já feita nesta redação. Às cinco da tarde, virou a página mais lembrada do dia — e em São Paulo O Estado de S. Paulo daria a página inteira a "Viva a República!".<br><br>
A tiragem acaba, a segunda leva acaba, e gente que nunca comprou O Ouvidor passa a comprar. Vem junto uma dívida que ninguém pediu: a partir de amanhã, tudo o que sair aqui vai ser lido como certeza. O próximo boato que entrar por aquela porta chega ao leitor com peso de fato antes de ter sido conferido. Acertar por sorte e acertar por análise produzem a mesma página — e só um dos dois dá para repetir amanhã.`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta4' }],
  },

  /* ========================================================================= *
   *  CARTA 4  --  como chamar o que aconteceu
   * ========================================================================= */
  carta4: {
    fase: 'A Palavra',
    titulo: 'Carta 4 — A Palavra Certa',
    momento: '15 de novembro, fim da tarde. Agora é oficial.',
    mapa: null,
    texto: `Na Câmara Municipal, por volta das seis da tarde, o vereador José do Patrocínio toma a palavra e lê a moção que declara extinta a monarquia. Patrocínio é jornalista, abolicionista e dono da Cidade do Rio. É também um homem negro, e é ele quem proclama a República civil um ano e meio depois da Abolição.<br><br>
À noite chega o texto do <b>Decreto nº 1</b>: fica proclamada <i>provisoriamente</i> a República Federativa, as províncias viram estados, um Governo Provisório manda até a Constituinte. Assinam Deodoro da Fonseca, Rui Barbosa, Quintino Bocaiúva, Benjamin Constant, Aristides Lobo e Wandenkolk.<br><br>
Nenhuma urna foi aberta. Nenhuma pergunta foi feita a ninguém — embora, desde a Lei Saraiva de 1881, as urnas do Império já falassem em nome de um por cento do país. Amanhã O Ouvidor tem que chamar isso de alguma coisa, e o governo que acabou de nascer lê jornal.`,
    pergunta: 'Golpe, revolução ou proclamação? Qual palavra O Ouvidor assina?',
    variantes: {
      aristoteles: {
        momento: '',
        texto: '',
        pergunta:
          'Três vezes esta mesa preferiu medir antes de falar. Golpe, revolução ou proclamação: qual palavra O Ouvidor assina?',
      },
      kant: {
        momento: '',
        texto: '',
        pergunta:
          'Três vezes esta mesa pagou para dizer a verdade. Golpe, revolução ou proclamação: qual palavra O Ouvidor assina?',
      },
      maquiavel: {
        momento: '',
        texto: '',
        pergunta:
          'Três vezes esta mesa jogou para continuar existindo. Golpe, revolução ou proclamação: qual palavra O Ouvidor assina?',
      },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'Nomear só o que já se sustenta',
        citacao: 'Nomear até onde os fatos chegam — e parar ali.',
        desc: 'A manhã contada em ordem, sem usar nenhum dos três rótulos, e dizendo por quê.',
        destino: 'r4a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: '"Golpe"',
        citacao: 'Chamar de outra coisa o que a gente viu é mentir com letra grande.',
        desc: 'A palavra que descreve o que aconteceu, na mesa do Governo Provisório amanhã cedo.',
        destino: 'r4b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: '"Proclamação"',
        citacao: 'A palavra que mantém a porta aberta vale mais que a que a fecha.',
        desc: 'O termo oficial, seco, e o jornal continua entrando nos gabinetes para perguntar depois.',
        destino: 'r4c',
      },
    ],
  },

  /* ---- consequencias da carta 4 ------------------------------------------ */
  r4a: {
    fase: 'A Palavra',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — A Palavra Certa',
    momento: 'O grupo escolheu a prudência.',
    mapa: null,
    texto: `A página traz a manhã inteira em ordem: a tropa, o ministério caído, a moção lida na Câmara, o decreto assinado por seis homens. Os três rótulos em disputa ficam de fora, e o jornal diz por quê.<br><br>
Um republicano escreve dizendo que faltou comemorar. Um monarquista escreve dizendo que faltou denunciar. Os dois leram covardia onde houve juízo. Vocês penduram as duas cartas na parede.<br><br>
<i>Os rótulos ficaram em aberto. Não vão ficar por muito tempo.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta5' }],
  },

  r4b: {
    fase: 'A Palavra',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — A Palavra Certa',
    momento: 'O grupo escolheu o dever.',
    mapa: null,
    texto: `"GOLPE." Cinco letras em corpo de cartaz, num jornal pequeno, no segundo dia de um governo armado.<br><br>
A edição some das mãos dos jornaleiros antes do meio-dia, e é impossível saber quanto disso foi leitor e quanto foi gente comprando para que ninguém lesse. À tarde, um oficial de baixa patente aparece na redação apenas para anotar nomes. Não ameaça, não prende, não explica. Anota e vai embora.<br><br>
<i>Vocês chamaram a coisa pelo nome no único mês em que isso ainda era barato. Em 23 de dezembro, um decreto do novo governo vai passar a punir quem atacar a República pela imprensa.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta5' }],
  },

  r4c: {
    fase: 'A Palavra',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — A Palavra Certa',
    momento: 'O grupo escolheu a estratégia.',
    mapa: null,
    texto: `"PROCLAMAÇÃO DA REPÚBLICA." O termo oficial, seco, sem um adjetivo de elogio. Quem quiser ler entusiasmo não acha; quem quiser ler crítica também não.<br><br>
Funciona. Na quinta-feira seguinte, O Ouvidor recebe pela primeira vez um comunicado do Governo Provisório antes dos jornais grandes, e o nome do jornal passa a circular em sala que antes não sabia que ele existia.<br><br>
<i>A porta ficou aberta. Falta descobrir para que lado ela abre.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Continuar', citacao: null, desc: null, destino: 'carta5' }],
  },

  /* ========================================================================= *
   *  CARTA 5  --  "o povo assistiu aquilo bestializado"
   * ========================================================================= */
  carta5: {
    fase: 'O Povo',
    titulo: 'Carta 5 — Bestializado',
    momento: '20 de novembro. A família imperial já partiu.',
    mapa: null,
    texto: `Na madrugada do dia 17, no Cais Pharoux, Dom Pedro II e a família embarcaram para a Europa. Foi rápido e discreto, para não dar plateia a ninguém.<br><br>
E chega à redação, pelo trem de São Paulo, o <i>Diário Popular</i> do dia 18, com um texto de <b>Aristides Lobo</b> escrito no calor do dia 15: <i>"O povo assistiu àquilo bestializado, atônito, surpreso, sem conhecer o que significava. Muitos acreditaram seriamente estar vendo uma parada."</i><br><br>
Lobo é republicano antigo e agora é ministro do Governo Provisório — o nome dele está no Decreto nº 1. Quem diz que o povo não entendeu nada é um dos donos da situação. Reproduzir a frase é dizer na cara do novo governo que a República nasceu sem o povo, e dizer isso com as palavras de um homem que está no governo.`,
    pergunta: 'Última edição desta sessão. O que o Ouvidor imprime sobre o dia 15?',
    variantes: {
      aristoteles: {
        momento: '',
        texto: '',
        pergunta:
          'Quatro vezes esta mesa mediu antes de falar. Última edição: o que o Ouvidor imprime sobre o dia 15?',
      },
      kant: {
        momento: '',
        texto: '',
        pergunta:
          'Quatro vezes esta mesa pagou o preço de dizer. Última edição: o que o Ouvidor imprime sobre o dia 15?',
      },
      maquiavel: {
        momento: '',
        texto: '',
        pergunta:
          'Quatro vezes esta mesa escolheu a hora certa. Última edição: o que o Ouvidor imprime sobre o dia 15?',
      },
    },
    escolhas: [
      {
        id: 'a',
        filosofo: 'aristoteles',
        titulo: 'A rua, sem a frase',
        citacao: 'Frase sozinha vira slogan; com gente dentro, vira notícia.',
        desc: 'Trinta depoimentos sobre o que cada um estava fazendo no dia 15. A frase de Lobo fica de fora.',
        destino: 'r5a',
      },
      {
        id: 'b',
        filosofo: 'kant',
        titulo: 'A frase inteira, e a cobrança',
        citacao: 'Se é verdade, não interessa quem se incomoda.',
        desc: 'A frase em destaque, com a assinatura do ministro e uma pergunta ao lado.',
        destino: 'r5b',
      },
      {
        id: 'c',
        filosofo: 'maquiavel',
        titulo: 'Guardar a frase',
        citacao: 'Munição gasta cedo é munição desperdiçada.',
        desc: 'Uma edição correta e inofensiva, e o recorte arquivado para quando valer mais.',
        destino: 'r5c',
      },
    ],
  },

  /* ---- consequencias da carta 5 ------------------------------------------ */
  r5a: {
    fase: 'O Povo',
    tipo: 'consequencia',
    filosofo: 'aristoteles',
    titulo: 'Consequência — Bestializado',
    momento: 'O grupo escolheu a prudência.',
    mapa: null,
    texto: `A página sai cheia de gente: o carregador que não pôde parar, a professora que aplaudiu sem saber direito o quê, o cocheiro que achou mesmo que era parada militar, o estudante que sabia de tudo fazia uma semana. A frase de Lobo fica de fora, porque sozinha ela vira slogan.<br><br>
Prudência é isso: olhar caso a caso. "O povo" não é um caso, é um saco onde cabe todo mundo. É a versão mais difícil de escrever e a menos citada depois.<br><br>
<i>Nos livros de história, "bestializado" vira a palavra do dia 15. A rua que vocês imprimiram no lugar dela some.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Fechar a edição', citacao: null, desc: null, destino: 'final' }],
  },

  r5b: {
    fase: 'O Povo',
    tipo: 'consequencia',
    filosofo: 'kant',
    titulo: 'Consequência — Bestializado',
    momento: 'O grupo escolheu o dever.',
    mapa: null,
    texto: `A frase ocupa o alto da primeira coluna, do tamanho que merece, com a assinatura de Aristides Lobo embaixo e uma pergunta ao lado: se o povo não entendeu, o que exatamente foi proclamado em nome dele?<br><br>
O ministro não responde. Não precisa. Na sexta-feira o fornecedor de papel corta o crédito sem explicar por quê, e a redação passa a tarde decidindo se a próxima edição sai em duas páginas ou não sai. Vocês cobraram do poder a mesma régua que ele usou para se elogiar. É a régua única de Kant, e ela caiu bem onde dói.<br><br>
<i>A pergunta está impressa. Papel não se retrata.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Fechar a edição', citacao: null, desc: null, destino: 'final' }],
  },

  r5c: {
    fase: 'O Povo',
    tipo: 'consequencia',
    filosofo: 'maquiavel',
    titulo: 'Consequência — Bestializado',
    momento: 'O grupo escolheu a estratégia.',
    mapa: null,
    texto: `A frase desce para a gaveta de baixo, numa pasta com data. A edição do dia sai correta, informativa e completamente inofensiva.<br><br>
Onze dias depois, um jornal grande reproduz a mesma frase de Lobo em página inteira e leva o crédito da pergunta que vocês tinham formulado primeiro. O recorte na gaveta vale zero. Maquiavel avisa no capítulo III do Príncipe: esperar o momento certo é ilusão, porque o tempo empurra tudo para a frente e traz o mal junto com o bem. Sempre há um momento melhor logo adiante. É assim que arquivo vira cemitério.<br><br>
<i>A frase está guardada. Ninguém nesta mesa sabe dizer o dia em que ela sai.</i>`,
    pergunta: null,
    variantes: {},
    escolhas: [{ id: 'a', filosofo: null, titulo: 'Fechar a edição', citacao: null, desc: null, destino: 'final' }],
  },

  /* =========================================================================
   *  O FINAL E UNICO. Todos os caminhos chegam aqui, com o mesmo texto.
   *  O que muda e o registro do caminho percorrido, montado pelo jogo.
   * ====================================================================== */
  final: {
    fase: 'O Que Ficou',
    titulo: 'A Edição de Amanhã',
    momento: 'A República existe. A prensa não para.',
    mapa: null,
    texto: `<b>O que esteve em disputa nesta mesa foi uma coisa só: que jornal O Ouvidor virou no caminho.</b><br><br>
Um jornal que mede antes de falar. Um jornal que fala e paga a conta. Um jornal que sobrevive e cobra depois. Nenhum dos três é desprezível, e nenhum dos três sai limpo — porque em novembro de 1889 não havia escolha limpa. Fingir que havia seria a única mentira deste jogo.<br><br>
O resto não dependia de vocês. Dom Pedro II está em alto-mar a caminho da Europa, as províncias viraram estados e um governo que ninguém elegeu está governando o Brasil. A História não estava esperando a votação desta sala.<br><br>
A República foi proclamada numa sexta-feira de novembro: de manhã caiu o ministério, e só à tarde apareceu a palavra. Boa parte da cidade foi entender o tamanho da coisa nos dias seguintes, lendo jornal. Tem historiador que diz que aquele povo estava alheio; tem historiador que diz que ele estava é desconfiado de um jogo cujas regras não eram dele.`,
    pergunta: null,
    variantes: {},
    citacaoFinal:
      'A pergunta nunca foi se a República ia existir. Foi quem teria o direito de contar como ela nasceu — e vocês decidiram isso cinco vezes.',
    escolhas: [],
  },
};
