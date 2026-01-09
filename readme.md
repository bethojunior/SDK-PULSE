# @704app/pulse

Automatic error tracking SDK for Node.js and Browser.

## Instalação

```bash
npm install @704app/pulse
# ou
yarn add @704app/pulse
# ou
pnpm add @704app/pulse
```

## Uso

### Opção 1: Inicialização Manual

Importe e configure o Pulse manualmente:

```javascript
import { Pulse } from '@704app/pulse';

// Inicializar com configuração manual
Pulse.init({
  app: 'billing-api',
  groupId: 'payments'
});

// Agora o Pulse está ativo e captura automaticamente:
// - Erros não tratados (uncaughtException, unhandledRejection)
// - Erros do console.error()
// - Erros do browser (window.error, unhandledrejection)
```

### Opção 2: Inicialização Automática via Variáveis de Ambiente

Para inicialização automática, importe o módulo `auto`:

```javascript
// No início do seu arquivo principal
import '@704app/pulse/auto';
```

E configure as variáveis de ambiente:

```bash
# .env ou variáveis de ambiente do sistema
PULSE_APP=billing-api
PULSE_GROUP=payments
```

### Opção 3: Inicialização Manual com Variáveis de Ambiente

```javascript
import { Pulse } from '@704app/pulse';

// Lê automaticamente PULSE_APP e PULSE_GROUP do process.env
Pulse.initFromEnv();
```

## Exemplos de Uso

### Node.js

```javascript
// app.js
import { Pulse } from '@704app/pulse';

Pulse.init({
  app: 'my-api',
  groupId: 'backend'
});

// O Pulse captura automaticamente:
// - Erros não tratados
// - Promises rejeitadas sem tratamento
// - console.error()

// Você também pode enviar logs manuais de emergência:
try {
  // seu código
} catch (error) {
  Pulse.emergency(error, 'custom.context');
}
```

### Browser

```javascript
// main.js
import { Pulse } from '@704app/pulse';

Pulse.init({
  app: 'my-frontend',
  groupId: 'web'
});

// O Pulse captura automaticamente:
// - Erros do window (window.error)
// - Promises rejeitadas (unhandledrejection)
// - console.error()

// Log manual de emergência:
try {
  // seu código
} catch (error) {
  Pulse.emergency(error, 'user-action');
}
```

### Com Variáveis de Ambiente (Node.js)

```javascript
// app.js - início do arquivo
import '@704app/pulse/auto';

// Resto do seu código...
// O Pulse será inicializado automaticamente se PULSE_APP e PULSE_GROUP estiverem definidos
```

```bash
# .env
PULSE_APP=my-api
PULSE_GROUP=backend
```

## API

### `Pulse.init(config)`

Inicializa o Pulse com configuração manual.

**Parâmetros:**
- `config.app` (string): Nome da aplicação
- `config.groupId` (string): ID do grupo

### `Pulse.initFromEnv()`

Inicializa o Pulse lendo `PULSE_APP` e `PULSE_GROUP` de `process.env`. Funciona apenas em Node.js.

### `Pulse.emergency(error, context?)`

Envia um log manual de emergência.

**Parâmetros:**
- `error` (any): O erro ou objeto a ser logado
- `context` (string, opcional): Contexto do erro (padrão: `'manual.emergency'`)

## O que é capturado automaticamente?

- ✅ Erros não tratados (uncaughtException)
- ✅ Promises rejeitadas (unhandledRejection)
- ✅ Erros do console.error()
- ✅ Erros do browser (window.error)
- ✅ Logs manuais via `Pulse.emergency()`

## Requisitos

- Node.js 14+ ou navegador moderno
- Suporte a ES Modules ou CommonJS
