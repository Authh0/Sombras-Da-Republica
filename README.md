# Sombras da República — A Trindade Filosófica

RPG cooperativo jogado pelo navegador sobre a crise do Império e a Proclamação da
República (1889). Um **Mestre** conduz a sessão; a turma entra pelo celular, **vota**
nas decisões e o caminho filosófico do grupo — Aristóteles, Kant ou Maquiavel — muda
o texto das cartas seguintes.

---

## Começando em 30 segundos

```bash
npm install
npm start
```

Abra `http://localhost:3000`. O terminal também mostra um endereço com número
(`http://192.168.x.x:3000`) — **esse** é o que a turma digita no celular.

Antes de apresentar, crie o arquivo de senha:

```bash
cp .env.example .env
```

e troque `SENHA_MESTRE` por uma senha de vocês. Sem esse arquivo o jogo funciona,
mas usa a senha padrão e avisa no terminal.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o jogo |
| `npm run dev` | Sobe reiniciando sozinho quando vocês salvam um arquivo |
| `npm run check-historia` | **Confere a história inteira.** Rode sempre antes de apresentar |
| `npm run roteiro` | Gera `roteiro-do-mestre.txt` a partir da história, para imprimir |
| `npm run teste-regras` | Testa a lógica: tendência, variantes, roteiro, fases (46 checagens) |
| `npm run teste` | Joga uma sessão completa sozinho com Mestre e 2 jogadores (59 checagens) |
| `npm test` | Verificador + os dois testes — 105 checagens no total |

---

## Como editar a história

Todo o conteúdo está em **`src/historia.js`**. É só texto — não precisa saber
programar para mexer. Cada carta tem título, momento, texto, pergunta e as opções
de voto.

Depois de editar, rode:

```bash
npm run check-historia
```

Ele avisa **antes da apresentação** sobre as coisas que, se passarem, só aparecem
quando alguém clica no botão errado na frente da turma:

- carta apontando para uma carta que não existe (erro de digitação)
- carta que ninguém nunca alcança
- caminho que nunca chega ao final
- carta sem saída no meio do jogo
- escolha sem filósofo marcado
- variante de texto ainda vazia

### Como o meio da história ramifica

O texto de vocês ("Texto DEFINITIVO do Mestre") tem uma **resposta própria para cada
escolha de cada carta**. É assim que a ramificação funciona:

```
CARTA 1  →  o grupo vota  →  RESPOSTA 1A, 1B ou 1C  →  CARTA 2
```

A carta de resposta é uma carta de verdade: aparece na tela de todo mundo, mostra a
consequência daquela decisão específica, traz um selo com a cor do filósofo escolhido
e só então leva à próxima carta. São **15 caminhos diferentes pelo meio da história**.

São 23 cartas no total: 8 de cena (prólogo, abertura, 5 cartas de decisão e o final)
e 15 de consequência.

O **final é único**: todos os caminhos chegam na mesma carta. O que muda é o
registro do caminho percorrido, que aparece na tela de encerramento junto com a
tendência dominante e a contagem por filósofo.

### As variantes por tendência (opcional, ainda vazias)

Além das respostas acima, o jogo soma todas as escolhas e sabe qual filósofo está
dominando a sessão. Se vocês quiserem que **o texto da própria carta** também mude
conforme essa tendência, é só preencher:

```js
carta3: {
  texto: 'Texto padrão, usado quando não há variante escrita.',
  variantes: {
    aristoteles: { momento: '', texto: '', pergunta: '' },
    kant:        { momento: '', texto: '', pergunta: '' },
    maquiavel:   { momento: '', texto: '', pergunta: '' },
  },
}
```

Preencham só o que quiserem mudar. Campo vazio cai no texto base — **o jogo nunca
quebra por falta de texto**. Quando uma variante está no ar, aparece um selo dizendo
qual versão a turma está lendo.

O verificador não enche o saco com variantes que vocês nunca começaram (lista as
cartas numa linha só). Ele **avisa de verdade** quando uma carta tem variante escrita
para um filósofo e faltando para outro — aí sim parte da turma veria texto novo e
parte veria o texto base.

---

## No dia da apresentação

**Plano A — hospedado na internet.** Serviços como Render ou Railway rodam o projeto
de graça. O jogo já lê a porta do ambiente (`process.env.PORT`), então é só apontar
para o repositório e definir `SENHA_MESTRE` nas variáveis do serviço.
*Risco:* no plano grátis o servidor hiberna e a primeira pessoa a abrir espera uns
40 segundos. Abram o link cinco minutos antes para "acordar" o servidor.

**Plano B — rodando no notebook de vocês.** Rodem `npm start` e passem para a turma
o endereço com número que aparece no terminal. Sem internet, sem hibernação, sem
firewall da escola no caminho.
*Dica:* wifi de escola costuma isolar os aparelhos entre si. O mais seguro é **abrir
um roteador no celular de vocês** e a turma conectar nele.

**Levem os dois.** Numa apresentação, plano B vale mais que qualquer refatoração.

### O roteiro do Mestre

O Mestre narra em voz alta; a turma acompanha pelo celular. O texto que ele lê
aparece **dentro do site**, numa área dourada no alto da tela que só ele enxerga —
com o botão *Esconder* para quem preferir ler no papel (a escolha fica guardada).

O mesmo texto sai em arquivo com `npm run roteiro`, já na ordem da sessão, com as
respostas A/B/C separadas e indicando para onde cada voto leva.

> **Os dois são gerados a partir de `src/historia.js`.** Foi assim que a versão
> anterior do roteiro saiu de sincronia sem ninguém notar: era um documento solto.
> Agora, editar a história atualiza o roteiro junto.

Duas coisas de propósito não entram no roteiro: as linhas em itálico das cartas de
consequência (*"O grupo escolheu a prudência"*), que são rótulo de tela, e a ordem
da Carta 4 — nela a tela mostra a pergunta na caixa destacada no fim, e o Mestre
a lê no meio, como está no texto original de vocês.

### Quem lê o quê

**Por padrão a turma não lê o texto da história — quem narra é o Mestre.** A tela dos
jogadores mostra a fase, o título, a linha de abertura da cena, a pergunta e as três
opções. O corpo do texto fica com ele.

Nas **cartas de consequência** a tela é ainda mais enxuta: só o emblema do filósofo,
*"Caminho de Maquiavel"* e o aviso de que o Mestre está narrando. A turma sabe qual
caminho venceu, mas a consequência só existe na voz dele.

Quando ele quiser, o botão **Revelar o texto na tela** mostra o texto completo para
todos — útil depois de narrar, para quem quiser reler antes de votar. Vira carta,
o texto se esconde de novo sozinho.

### Controles do Mestre

- **Tocar numa opção** seleciona; **Confirmar decisão** é que avança. Dois toques de
  propósito, para ninguém pular uma carta sem querer.
- A **trilha de losangos** no topo mostra em que fase das sete a sessão está.
- **Voltar uma carta** desfaz o último passo — o salva-vidas se o Mestre errar o clique.
- **Reiniciar sessão** volta ao prólogo e limpa o caminho. Pede confirmação antes,
  para não apagar a sessão da turma com um toque errado.
- **Revelar o texto na tela** mostra (ou esconde) o corpo da carta para a turma inteira.
- **Saltar para outra carta** fica recolhido no fim do painel: é atalho de emergência
  para quando o tempo apertar. Pede confirmação, e as cartas puladas **não** entram no
  caminho filosófico — o registro final continua sendo só o que a turma escolheu.
- **Sair** devolve qualquer participante à tela inicial. **A sessão da turma continua
  exatamente onde estava** — quem saiu apenas deixa de participar. Para voltar como
  Mestre é preciso digitar a senha de novo, porque sair também tira o poder de Mestre
  no servidor, não só no navegador.
- O painel mostra quantos votaram e qual opção está na frente. **Empate é o Mestre
  quem desempata.**

---

## Aparência

A interface é desenhada como um documento de 1889: papel escurecido, tipografia
com serifa, filetes com losango, capitular abrindo cada carta.

**Fontes.** Playfair Display nos títulos (é uma serifa "didone", o estilo dos jornais
e cartazes do século XIX) e Libre Baskerville no corpo, que foi desenhada para leitura
em tela pequena. As duas ficam **dentro do projeto**, em `public/fonts/` — nada é
carregado do Google Fonts, então nenhum filtro de rede derruba a tipografia no meio da
apresentação. Ambas são SIL Open Font License e as licenças estão junto dos arquivos.

**Capa.** A tela inicial tem ao fundo a cena do 15 de novembro vista do alto do Rio
(`public/images/capa.jpg`, e uma versão mais leve e mais fechada para o celular).
O título e os emblemas **não estão dentro da imagem**: são texto desenhado por cima,
para continuarem nítidos e do tamanho certo em qualquer tela — texto embutido em foto
ficaria minúsculo ou cortado no celular. As duas versões somam cerca de 120 KB e só
carregam na tela inicial.

**Emblemas.** Cada filósofo tem um medalhão desenhado em SVG, em `public/js/emblemas.js`:
a balança em equilíbrio (Aristóteles), o céu estrelado sobre o horizonte com um ponto
abaixo dele (Kant) e a raposa coroada (Maquiavel). São desenhos próprios do projeto,
escritos em código — não há imagem copiada de lugar nenhum, nada precisa ser creditado,
e cada um pesa cerca de 2 KB, então carregam na hora mesmo em internet ruim.

## Estrutura

```
public/            o que o navegador baixa
  index.html
  styles/index.css
  js/app.js        só desenha a tela e manda pedidos
  js/emblemas.js   os três medalhões em SVG
  fonts/           Playfair Display e Libre Baskerville
  images/capa.jpg · capa-celular.jpg · mapa.jpg
src/
  historia.js      TODO O CONTEÚDO DO JOGO (é aqui que vocês editam)
  regras.js        lógica pura: tendência, transições válidas, apuração
server/
  server.js        o dono da verdade: autentica, valida e replica
tools/
  check-historia.js   npm run check-historia
  teste-sessao.js     npm run teste
```

`src/regras.js` é importado **pelo servidor, pelo navegador e pelo verificador ao
mesmo tempo**. Uma fonte de verdade só, sem etapa de build — é por isso que a tela
nunca discorda do servidor sobre qual carta está no ar.

---

## O que mudou da versão 1

A versão anterior tinha problemas que só apareceriam na frente da turma. Todos foram
reproduzidos antes de consertar, e todos têm teste garantindo que não voltam.

**Segurança da sessão**

- O navegador decidia sozinho quem era Mestre (senha `'123'` escrita no JavaScript do
  cliente) e o servidor obedecia **qualquer** conexão que mandasse o evento certo.
  Um aluno com o console aberto pulava a sessão para o final. Agora a senha é
  conferida no servidor e só quem passou por ela controla a sessão.
- O servidor não validava a transição: dava para saltar da carta 1 para o final.
  Agora o destino precisa ser um destino declarado da carta atual.
- `express.static` servia a pasta raiz inteira — `package.json` e `node_modules`
  respondiam 200 para qualquer um. Agora só `public/` e `src/` são expostos.
- Clique duplo do Mestre registrava o caminho filosófico duas vezes. Agora cada
  avanço carrega um número de versão e o segundo clique é descartado.

**Coisas quebradas**

- `npm start` não existia (sem script `start`, `main` apontando para um arquivo
  inexistente).
- O botão do mapa aparecia como um círculo cinza: o CSS pedia `images/mapa.jpg`, mas
  caminho em CSS é relativo ao arquivo `.css`, então procurava em `styles/images/`.
- `body` era `display:flex` sem `flex-direction`, então painel e jogo ficavam lado a
  lado — no celular o jogo era espremido em 230px de largura.
- O modal do mapa usava quatro classes que não existiam no CSS. O mesmo com
  `.stat-box` no HTML contra `.stat-tag` no CSS.
- `alert()` e `prompt()` travavam a página e são bloqueados em alguns navegadores de
  celular. Viraram formulário e avisos na própria tela.
- Porta fixa em 3000 sem `process.env.PORT`: não subia em nenhum serviço de hospedagem.
- `transports: ['websocket']` sem alternativa: em rede com proxy simplesmente não
  conectava. Agora tem `polling` de reserva.
- `node_modules` estava versionado no Git (952 arquivos) e não havia `.gitignore`.
- Licença inconsistente: `LICENSE` dizia MIT, `package.json` dizia ISC.

**Design do jogo**

- As três opções de cada carta levavam todas para a mesma carta seguinte e o final
  era idêntico em qualquer caminho — a escolha filosófica não mudava nada. Agora a
  tendência acumulada do grupo escolhe a versão do texto das cartas seguintes.
- Os jogadores eram espectadores: os botões ficavam desabilitados com um alerta.
  Agora votam, veem a apuração ao vivo e o Mestre confirma.

**Acessibilidade e celular**

- CSS reescrito mobile-first, com alvos de toque de 48px, foco visível para teclado,
  `Esc` fechando o mapa, respeito a `prefers-reduced-motion` e à área segura do
  aparelho. Sem rolagem horizontal em 390px.

---

## Licença

MIT — veja [LICENSE](LICENSE).
