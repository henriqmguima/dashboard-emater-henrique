# dashboard-emater
A EMATER nao tem uma ferramenta digital para observar a Agrometeorologia da regiao rural de Charqueadas para orientar o planeamento e a gestão de atividades do agronegócio.

A turma de Atividade de Extensao II vai criar um dashboard que contem um mapa interativo com os principais distritos rurais de charqueadas.
Esta assumido que em cada distrito estara instalado um pluviometro IoT que envia medicoes para uma API.

Inicialmente, os dados serao consultados do site https://www.agroapi.cnptia.embrapa.br/portal/ para a Prova de Conceito. Os dados da Agro API sao consultados a partir de Latitude e Longitude.

Tambem consultaremos dados do INMET, no Jardim Botanico de POA, porque os dados do INMET tem uma resposta mais amigavel para tratamento em um front-end.

Finalmente, como erceira frente de trabalho, vamos assumir que o IFSul vai manter uma API para consulta dos dados dos pluviometros. A ser desenvolvida por outro projeto ou TCC.


## Apêndice

As ferramentas e tecnologias utilizadas nos códigos para o mapa interativo foram:

1. React + Vite
Esta é a base do projeto. React é uma biblioteca JavaScript para construir interfaces de usuário de forma declarativa e eficiente. Vite é um "bundler" e servidor de desenvolvimento extremamente rápido que otimiza a forma como o código é empacotado para o navegador. A combinação dos dois é uma das pilhas de tecnologia mais populares e eficientes para criar aplicações web modernas.

2. Leaflet
É uma biblioteca JavaScript de código aberto e totalmente gratuita, projetada para criar mapas interativos. A principal vantagem do Leaflet é que ele é leve e focado em simplicidade, mas ainda assim oferece todas as funcionalidades essenciais de mapeamento, como zoom, pan e marcações, sem a necessidade de APIs pagas.

3. React-Leaflet
Esta biblioteca funciona como uma "ponte" entre o React e o Leaflet. Em vez de manipular o DOM diretamente como o Leaflet faz, o React-Leaflet permite que você use os recursos do Leaflet como componentes React. Isso torna a criação e o gerenciamento do mapa mais "React-like", aproveitando o sistema de componentes, o estado e as propriedades.

4. React Router DOM
O React Router DOM é a biblioteca padrão para gerenciar a navegação em aplicações React de página única (Single Page Applications). Ele permite que você defina diferentes rotas (URLs) para sua aplicação, como / para o mapa principal e /bairro/:nomeBairro para a página de detalhes, criando uma experiência de navegação fluida sem recarregar a página inteira.

5. OpenStreetMap
O OpenStreetMap (OSM) é uma fonte de dados de mapas gratuita e de código aberto, criada por uma comunidade global. É a "base" visual do mapa que aparece no seu projeto. Utilizamos os TileLayers do OSM, que são as "peças" de imagem do mapa, para preencher o fundo da sua aplicação. É uma alternativa excelente e gratuita a serviços como Google Maps ou Mapbox, que costumam cobrar pelo uso.

Em resumo, a escolha dessas ferramentas foi baseada em uma combinação de fatores: elas são gratuitas, amplamente utilizadas na comunidade e se integram de forma coesa para oferecer uma solução completa e eficiente para o projeto.

### Instalação de Pacotes
`npm install`
`npm install @phosphor-icons/react`
`npm install react-router-dom`
`npm install react-chartjs-2 chart.js`