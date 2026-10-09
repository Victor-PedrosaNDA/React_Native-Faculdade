
# 📱 LogicMoney App - React Native & Expo (Faculdade)
>>>>>>> a405e64cae32225dee28c0b082cb76c86fd4756a

Aplicativo de finanças pessoais desenvolvido em **React Native** e **Expo** como projeto da disciplina Programação para Dispositivos Móveis.

<<<<<<< HEAD
Desenvolvido para fins institucionais, o app mantém as telas e a navegação do projeto original e inclui recursos para registrar e acompanhar receitas e despesas.
=======
Este aplicativo foi feito para fins institucionais com foco em código limpo, componentização e navegação baseada em rotas estruturadas.
>>>>>>> a405e64cae32225dee28c0b082cb76c86fd4756a

## 🛠️ Tecnologias e Ecossistema

O projeto utiliza um stack moderno para desenvolvimento multiplataforma:

* [**React Native**](https://reactnative.dev/) — Framework principal para criação de interfaces nativas.

* [**Expo**](https://expo.dev/) — Plataforma que acelera o desenvolvimento e testes em dispositivos móveis.

* [**Expo Router**](https://docs.expo.dev/router/introduction/) — Sistema de roteamento baseado em arquivos (File-based routing).

* **Expo FileSystem e Expo Sharing** — Criação e compartilhamento do relatório CSV no dispositivo.

* **React Native SVG** — Renderização do gráfico de despesas por categoria.

* **TypeScript** — Tipagem estática para maior segurança e escalabilidade do código.

* **Node.js & npm** — Gerenciamento de pacotes e dependências.

## 📂 Arquitetura do Projeto

A estrutura de pastas foi organizada de forma modular para facilitar a manutenção e o dimensionamento das telas e lógica de negócio:

```
MeuApp/
├── assets/          # Recursos estáticos (imagens, fontes e ícones)
├── src/
│   ├── app/         # Telas, rotas e layouts do aplicativo (Expo Router)
│   │   ├── atividades/  # Tela Carteira
│   │   ├── _layout.tsx  # Layout principal e provedores de navegação
│   │   ├── explore.tsx  # Metas e hábitos
│   │   ├── extrato.tsx  # Extrato, filtros, edição e exportação CSV
│   │   ├── index.tsx    # Painel mensal
│   │   └── lancamento.tsx # Formulário de receitas e despesas
│   ├── components/  # Componentes reutilizáveis, incluindo gráfico e editor
│   ├── constants/   # Configurações globais e esquemas de cores
│   ├── hooks/       # Contexto financeiro e gerenciamento de temas e cores
│   └── utils/       # Cálculos financeiros, filtros, agrupamento e CSV
├── package.json     # Dependências e scripts do projeto
└── tsconfig.json    # Configurações do TypeScript


```

## 🚀 Funcionalidades Principais

* **Painel mensal:** navegação entre meses, saldo, receitas, despesas e gráfico de despesas por categoria.

* **Lançamentos:** cadastro de receitas e despesas com valor, categoria, data, método de pagamento, recorrência e recebimento previsto.

* **Extrato:** lançamentos agrupados por dia, com busca sem distinção de acentos, filtros por tipo e edição ou exclusão com confirmação.

* **Exportação CSV:** exporta os lançamentos do mês selecionado; no celular abre a folha de compartilhamento e na web inicia o download.

* **Navegação e interface:** telas organizadas com Expo Router, componentes reutilizáveis e suporte aos temas claro e escuro do sistema.

* **Persistência local:** os lançamentos são salvos no armazenamento do aparelho e restaurados ao abrir o app novamente.

* **Testes automatizados:** cobertura das regras de resumo mensal, filtros, agrupamento, exportação CSV e persistência local.

## ℹ️ Estado atual e limitações

Os lançamentos persistem **somente neste aparelho**. O AsyncStorage não é criptografado; evite armazenar informações altamente sensíveis. Ainda não há autenticação, sincronização com Supabase, Row Level Security ou integração com bancos via Open Finance/Pluggy. Reinstalar ou limpar os dados do app pode apagar os lançamentos locais; exporte o CSV para manter uma cópia.

## ⚙️ Como Executar o Projeto Localmente

Certifique-se de ter o **Node.js** instalado em sua máquina.

1. **Clone o repositório:**

   ```
   git clone https://github.com/Victor-PedrosaNDA/React_Native-Faculdade.git
   
   
   ```

2. **Entre na pasta do projeto:**

   ```
   cd MeuApp
   
   
   ```

3. **Instale as dependências:**

   ```
   npm install
   
   
   ```

4. **Inicie o projeto:**

   ```
   npx expo start
   
   
   ```

5. **Visualizando no dispositivo:**

   * Baixe o aplicativo **Expo Go** no seu celular (Android ou iOS).

   * Escaneie o QR Code que aparecerá no seu terminal.

## 🧪 Testes

Execute os testes automatizados com:

```sh
npm test
```

## 👨‍💻 Autor

Desenvolvido por **Victor Cardozo Pedrosa**

*Estudante de Análise e Desenvolvimento de Sistemas — IESB*

“O código perfeito não é apenas o que roda sem erros, é o que transforma a intenção humana em realidade digital.”

🔗 [GitHub](https://github.com/Victor-PedrosaNDA)
