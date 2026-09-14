# Sombras da República — A Trindade Filosófica

RPG cooperativo jogado pelo navegador sobre a crise do Império e a Proclamação da
República (1889). Um **Mestre** conduz a sessão; a turma entra pelo celular, **vota**
nas decisões e o caminho filosófico do grupo — Aristóteles, Kant ou Maquiavel — muda
o texto das cartas seguintes.

---

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

## Licença

MIT — veja [LICENSE](LICENSE).
