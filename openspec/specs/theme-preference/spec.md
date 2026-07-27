# theme-preference

## Purpose

Preferência visual do app: seleção entre tema claro, escuro ou sistema, com persistência local no cliente.

## Requirements

### Requirement: Preferência de tema com três modos
O frontend SHALL permitir escolher o tema visual entre **Claro** (`light`), **Escuro** (`dark`) e **Sistema** (`system`). Em `system`, o tema efetivo SHALL seguir `prefers-color-scheme` do navegador.

#### Scenario: Modo claro
- **WHEN** o usuário seleciona **Claro**
- **THEN** o app aplica aparência clara independentemente da preferência do sistema

#### Scenario: Modo escuro
- **WHEN** o usuário seleciona **Escuro**
- **THEN** o app aplica aparência escura independentemente da preferência do sistema

#### Scenario: Modo sistema segue o navegador
- **WHEN** o usuário seleciona **Sistema** e o navegador reporta `prefers-color-scheme: dark`
- **THEN** o app aplica aparência escura
- **WHEN** a preferência do sistema muda para claro
- **THEN** o app atualiza para aparência clara sem recarregar a página

### Requirement: Persistência local da preferência de tema
O frontend SHALL persistir a preferência de tema em `localStorage` no cliente e restaurá-la em visitas subsequentes.

#### Scenario: Restaurar escolha salva
- **WHEN** o usuário retorna ao app após escolher um tema
- **THEN** o frontend carrega a preferência salva e aplica o tema correspondente

#### Scenario: Primeira visita usa sistema
- **WHEN** não há preferência salva
- **THEN** o frontend usa `system` como default
