# Como Testar o @704app/pulse Antes de Publicar

Este guia rápido mostra como testar o pacote localmente antes de publicar no npm.

## Método Rápido: npm link

### 1. No diretório do pacote (`pulse`)

```bash
# Build do pacote
npm run build

# Criar link
npm link
```

### 2. No seu projeto de teste

```bash
# Criar projeto de teste (se ainda não tiver)
mkdir test-pulse-project
cd test-pulse-project
npm init -y

# Linkar o pacote
npm link @704app/pulse
```

### 3. Testar

Crie um arquivo `test.js`:

```javascript
import { Pulse } from '@704app/pulse';

Pulse.init({
  app: 'test-app',
  groupId: 'test-group'
});

// Teste suas funcionalidades
Pulse.emergency(new Error('Teste'), 'test.context');
```

Execute:
```bash
node test.js
```

## Método Alternativo: npm pack

### 1. No diretório do pacote

```bash
npm run build
npm pack
```

Isso cria um arquivo `704app-pulse-0.1.0.tgz`

### 2. No projeto de teste

```bash
npm install ../pulse/704app-pulse-0.1.0.tgz
```

### 3. Testar normalmente

```javascript
import { Pulse } from '@704app/pulse';
// ... seu código
```

## Arquivo de Exemplo

Use o arquivo `test-example.js` incluído no projeto:

```bash
# No diretório do pacote
npm run build && npm link

# Em outro terminal, criar projeto de teste
mkdir test-pulse
cd test-pulse
npm init -y
npm link @704app/pulse

# Copiar o arquivo de teste
cp ../pulse/test-example.js .

# Executar
node test-example.js
```

## O que Testar

- ✅ Inicialização manual (`Pulse.init()`)
- ✅ Inicialização com env (`Pulse.initFromEnv()`)
- ✅ Log manual (`Pulse.emergency()`)
- ✅ Captura automática de erros não tratados
- ✅ Captura de promises rejeitadas
- ✅ Interceptação de `console.error()`
- ✅ Funciona em Node.js (ESM e CommonJS)
- ✅ Funciona no Browser

## Limpar Após Testes

```bash
# No projeto de teste
npm unlink @704app/pulse

# No diretório do pacote
npm unlink
```

## Dicas

- Use `npm link` durante desenvolvimento (mudanças são refletidas após rebuild)
- Use `npm pack` para testar o empacotamento final antes de publicar
- Sempre faça `npm run build` antes de testar
- Teste em diferentes ambientes (Node.js ESM, CommonJS, Browser)
