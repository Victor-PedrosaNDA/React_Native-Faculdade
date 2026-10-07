# 📱 LogicMoney App - React Native & Expo (Faculdade)

Repositório oficial de atividades práticas e projetos desenvolvidos com **React Native**

Este aplicativo foi feito para fins institucionais com foco em código limpo, componentização e navegação baseada em rotas estruturadas.

## 🛠️ Tecnologias e Ecossistema

O projeto utiliza um stack moderno para desenvolvimento multiplataforma:

* [**React Native**](https://reactnative.dev/) — Framework principal para criação de interfaces nativas.

* [**Expo**](https://expo.dev/) — Plataforma que acelera o desenvolvimento e testes em dispositivos móveis.

* [**Expo Router**](https://docs.expo.dev/router/introduction/) — Sistema de roteamento baseado em arquivos (File-based routing).

* **TypeScript** — Tipagem estática para maior segurança e escalabilidade do código.

* **Node.js & npm** — Gerenciamento de pacotes e dependências.

## 📂 Arquitetura do Projeto

A estrutura de pastas foi organizada de forma modular para facilitar a manutenção e o dimensionamento das telas e lógica de negócio:

```
MeuApp/
├── assets/          # Recursos estáticos (imagens, fontes e ícones)
├── src/
│   ├── app/         # Telas, rotas e layouts do aplicativo (Expo Router)
│   │   ├── atividades/  # Exercícios e entregas práticas da faculdade
│   │   ├── _layout.tsx  # Layout principal e provedores de navegação
│   │   ├── explore.tsx  # Tela de exploração de recursos
│   │   ├── index.tsx    # Tela inicial (Home)
│   │   └── lancamento.tsx # Tela de registros e formulários
│   ├── components/  # Componentes reutilizáveis de interface (UI, abas, badges)
│   ├── constants/   # Configurações globais e esquemas de cores
│   ├── hooks/       # Custom hooks (ex: gerenciamento de temas e cores)
│   └── utils/       # Funções utilitárias e regras de negócio (ex: cálculos matemáticos)
├── package.json     # Dependências e scripts do projeto
└── tsconfig.json    # Configurações do TypeScript


```

## 🚀 Funcionalidades Principais

* **Navegação Dinâmica:** Telas organizadas e gerenciadas através do Expo Router.

* **Módulo de Atividades:** Espaço dedicado para o desenvolvimento e testes das tarefas acadêmicas.

* **Componentes Customizados:** Elementos visuais reutilizáveis para manter a consistência da interface.

* **Suporte a Temas:** Adaptação de esquemas de cores para melhor experiência visual.

* **Lógica Utilitária:** Funções separadas para processamento de dados e cálculos.

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

## 👨‍💻 Autor

Desenvolvido por **Victor Cardozo Pedrosa**

*Estudante de Análise e Desenvolvimento de Sistemas — IESB*

“O código perfeito não é apenas o que roda sem erros, é o que transforma a intenção humana em realidade digital.”

🔗 [GitHub](https://github.com/Victor-PedrosaNDA)
