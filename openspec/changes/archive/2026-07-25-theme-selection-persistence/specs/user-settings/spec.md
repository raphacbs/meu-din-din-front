## ADDED Requirements

### Requirement: Seletor de aparência na tela de configurações
A tela `/settings` SHALL expor um controle para escolher a aparência do app entre **Claro**, **Escuro** e **Sistema**, com rótulos em português.

#### Scenario: Alterar tema nas configurações
- **WHEN** o usuário autenticado abre `/settings` e seleciona uma opção de aparência
- **THEN** o tema do app muda imediatamente
- **AND** a escolha fica persistida localmente para visitas futuras
