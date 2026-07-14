# antd-app-shell

## Purpose

Shell autenticado do frontend: sidebar lateral clara com navegação, ações de sessão e header com criação rápida de transação.

## Requirements

### Requirement: App usa layout lateral com sidebar de navegação

O frontend SHALL renderizar o layout autenticado com sidebar lateral clara usando `antd Layout + Sider + Menu`, substituindo o header com navegação horizontal anterior. O Sider SHALL usar tema claro (fundo claro, texto legível) e NÃO o tema escuro padrão do antd.

#### Scenario: Sidebar exibe os itens de navegação com ícones

- **WHEN** um usuário autenticado acessa qualquer tela da aplicação
- **THEN** o sidebar exibe os itens Dashboard, Transações e Extrato como links de navegação
- **AND** cada item exibe um ícone de `@ant-design/icons` junto ao rótulo
- **AND** o item correspondente à rota atual está visivelmente destacado como ativo

#### Scenario: Sidebar preserva contraste legível no tema claro

- **WHEN** o sidebar é renderizado
- **THEN** o fundo do Sider é claro (branco ou token de superfície)
- **AND** o nome da aplicação "Meu Din Din" usa a cor da marca (`cash-green`) com contraste suficiente
- **AND** o email do usuário e demais textos do rodapé permanecem legíveis sobre o fundo claro

#### Scenario: Sidebar exibe email e botão de logout

- **WHEN** um usuário autenticado está na aplicação
- **THEN** o sidebar exibe o email do usuário logado
- **AND** o sidebar exibe um botão "Sair" que encerra a sessão ao ser acionado

#### Scenario: Sidebar é colapsável em telas pequenas

- **WHEN** a janela do navegador está em largura menor que o breakpoint de tablet
- **THEN** o sidebar pode ser colapsado para exibir apenas ícones
- **AND** o conteúdo principal ocupa o espaço disponível após o colapso

### Requirement: Header exibe ação principal de criação de transação

O frontend SHALL exibir um botão de acesso rápido à criação de transação no header do layout autenticado.

#### Scenario: Botão "Nova transação" está acessível no header

- **WHEN** um usuário autenticado está em qualquer tela da aplicação
- **THEN** o header exibe o botão "Nova transação"
- **AND** ao acionar o botão o usuário é navegado para `/transactions/new`
