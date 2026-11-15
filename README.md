# Cartoon Memories — Os Simpsons

Projeto acadêmico de Front-End desenvolvido com HTML, CSS e JavaScript puro.
pages: https://becagc-dev.github.io/cartoon-memories-simpsons/

## Como executar
1. Extraia a pasta `cartoon_memories`.
2. Abra a pasta no Visual Studio Code.
3. Abra `index.html` com a extensão Live Server (recomendado) ou em um navegador.
4. É necessária conexão com a internet para carregar a API e a fonte externa.

## API utilizada
Endpoint: https://apisimpsons.fly.dev/api/personajes?limit=1000

A aplicação usa `fetch()` para consultar a API, converte a resposta com `response.json()` e cria os cards dinamicamente com `document.createElement()` e `appendChild()`.

## Estrutura
- `index.html` — estrutura e conteúdo da página.
- `css/style.css` — identidade visual e responsividade.
- `js/script.js` — consumo da API, pesquisa e criação dos cards.

## Observação
A API é um serviço externo. Se estiver indisponível, os personagens não serão carregados até que o serviço volte. Confira a documentação/endpoint antes da apresentação.
