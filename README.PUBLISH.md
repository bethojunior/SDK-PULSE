# Como Publicar o @704app/pulse no NPM

Este guia explica passo a passo como publicar o pacote `@704app/pulse` no npm.

## Pré-requisitos

1. **Conta no npm**: Crie uma conta em [npmjs.com](https://www.npmjs.com/signup)
2. **Organização @704app**: Você precisa ter acesso à organização `@704app` no npm, ou criar uma nova organização
3. **npm CLI instalado**: Certifique-se de ter o npm instalado

## Passo 1: Login no npm

Primeiro, faça login na sua conta npm:

```bash
npm login
```

Você será solicitado a inserir:
- Username
- Password
- Email
- OTP (se tiver autenticação de dois fatores ativada)

## Passo 2: Verificar se está logado

```bash
npm whoami
```

Deve mostrar seu username do npm.

## Passo 3: Criar/Verificar Organização (se necessário)

Se você estiver usando um escopo (`@704app`), você precisa:

1. **Criar a organização no npm** (se ainda não existir):
   - Acesse [npmjs.com](https://www.npmjs.com)
   - Vá em "Add Organization"
   - Crie a organização `704app`

2. **Adicionar membros** (se necessário):
   - Vá nas configurações da organização
   - Adicione os membros que precisam publicar pacotes

## Passo 4: Build do Projeto

Antes de publicar, certifique-se de que o projeto está buildado:

```bash
npm run build
```

Isso vai gerar os arquivos na pasta `dist/` que serão publicados.

## Passo 5: Verificar o package.json

Certifique-se de que o `package.json` está correto:

- ✅ `name`: `@704app/pulse`
- ✅ `version`: versão atual (ex: `0.1.0`)
- ✅ `files`: inclui `dist` (os arquivos que serão publicados)
- ✅ `main`, `module`, `exports`: apontam para os arquivos corretos

## Passo 6: Testar o Pacote Localmente (IMPORTANTE!)

Antes de publicar, é **essencial** testar o pacote localmente para garantir que tudo funciona. Existem 3 métodos principais:

### Método 1: npm link (Recomendado para desenvolvimento)

Este método cria um link simbólico que permite testar o pacote em tempo real:

**No diretório do pacote (`pulse`):**
```bash
# 1. Build do pacote
npm run build

# 2. Criar o link
npm link
```

**No diretório do projeto de teste:**
```bash
# 3. Linkar o pacote no projeto de teste
npm link @704app/pulse
```

Agora você pode usar o pacote normalmente no seu projeto de teste:

```javascript
// test-project/index.js
import { Pulse } from '@704app/pulse';

Pulse.init({
  app: 'test-app',
  groupId: 'test-group'
});

// Teste suas funcionalidades...
```

**Vantagens:**
- ✅ Mudanças no código fonte são refletidas automaticamente (após rebuild)
- ✅ Ideal para desenvolvimento iterativo
- ✅ Não precisa reinstalar a cada mudança

**Para desfazer o link:**
```bash
# No projeto de teste
npm unlink @704app/pulse

# No diretório do pacote
npm unlink
```

### Método 2: npm pack + instalação local (Mais próximo do npm real)

Este método simula exatamente como o pacote será instalado do npm:

**No diretório do pacote (`pulse`):**
```bash
# 1. Build do pacote
npm run build

# 2. Criar o arquivo .tgz
npm pack
```

Isso cria um arquivo como `704app-pulse-0.1.0.tgz`.

**No diretório do projeto de teste:**
```bash
# 3. Instalar o arquivo .tgz
npm install /caminho/para/pulse/704app-pulse-0.1.0.tgz

# Ou se estiver na mesma máquina:
npm install ../pulse/704app-pulse-0.1.0.tgz
```

**Vantagens:**
- ✅ Simula exatamente a instalação do npm
- ✅ Testa o processo completo de empacotamento
- ✅ Verifica se todos os arquivos necessários estão incluídos

**Limitações:**
- ⚠️ Precisa reinstalar após cada mudança
- ⚠️ Precisa fazer `npm pack` novamente após mudanças

### Método 3: Instalação direta do diretório (Simples e rápido)

**No diretório do projeto de teste:**
```bash
npm install /caminho/absoluto/para/pulse

# Ou relativo:
npm install ../pulse
```

**Vantagens:**
- ✅ Mais simples e direto
- ✅ Funciona bem para testes rápidos

**Limitações:**
- ⚠️ Pode ter problemas com caminhos relativos
- ⚠️ Não testa o processo de empacotamento

### Exemplo Completo de Teste

Crie um projeto de teste simples:

```bash
# Criar diretório de teste
mkdir test-pulse
cd test-pulse

# Inicializar projeto
npm init -y

# Instalar o pacote (usando um dos métodos acima)
npm link @704app/pulse
# ou
npm install ../pulse/704app-pulse-0.1.0.tgz
```

**Criar arquivo de teste (`test.js`):**
```javascript
import { Pulse } from '@704app/pulse';

// Teste 1: Inicialização manual
console.log('Teste 1: Inicialização manual');
Pulse.init({
  app: 'test-app',
  groupId: 'test-group'
});
console.log('✅ Inicialização OK');

// Teste 2: Log manual
console.log('Teste 2: Log manual');
try {
  throw new Error('Erro de teste');
} catch (error) {
  Pulse.emergency(error, 'test.context');
  console.log('✅ Log manual OK');
}

// Teste 3: Erro não tratado (será capturado automaticamente)
console.log('Teste 3: Erro não tratado');
setTimeout(() => {
  throw new Error('Erro não tratado de teste');
}, 1000);

// Teste 4: Promise rejeitada (será capturada automaticamente)
console.log('Teste 4: Promise rejeitada');
Promise.reject(new Error('Promise rejeitada de teste'));

console.log('Todos os testes iniciados. Aguarde alguns segundos...');
```

**Executar o teste:**
```bash
node test.js
```

### Verificar o Build

Antes de testar, sempre verifique se o build está correto:

```bash
# Build
npm run build

# Verificar estrutura do dist/
ls -la dist/

# Deve conter:
# - index.js (ESM)
# - index.cjs (CommonJS)
# - auto.js (ESM)
# - auto.cjs (CommonJS)
# - sourcemaps (se habilitado)
```

### Testar em Ambientes Diferentes

Teste em diferentes ambientes:

**Node.js (ESM):**
```javascript
// test-esm.mjs
import { Pulse } from '@704app/pulse';
Pulse.init({ app: 'test', groupId: 'test' });
```

**Node.js (CommonJS):**
```javascript
// test-cjs.js
const { Pulse } = require('@704app/pulse');
Pulse.init({ app: 'test', groupId: 'test' });
```

**Browser:**
```html
<!-- test.html -->
<script type="module">
  import { Pulse } from './node_modules/@704app/pulse/dist/index.js';
  Pulse.init({ app: 'test', groupId: 'test' });
</script>
```

## Passo 7: Verificar se o pacote está pronto

Execute o comando `npm pack` para ver o que será publicado (sem publicar de fato):

```bash
npm pack
```

Isso cria um arquivo `.tgz` que você pode inspecionar. Você pode deletá-lo depois.

**Verificar o conteúdo do pacote:**
```bash
# Extrair e inspecionar
tar -tzf 704app-pulse-0.1.0.tgz

# Deve mostrar:
# package/package.json
# package/dist/index.js
# package/dist/index.cjs
# package/dist/auto.js
# package/dist/auto.cjs
# package/README.md
# etc...
```

## Passo 8: Publicar no npm

### Publicação Normal

```bash
npm publish
```

### Publicação com Escopo (Organização)

Se você estiver usando um escopo (`@704app`), você precisa publicar com acesso público:

```bash
npm publish --access public
```

**Por padrão, pacotes com escopo são privados.** Se você quer que seja público (gratuito), use `--access public`.

## Passo 9: Verificar Publicação

Após publicar, verifique se o pacote está disponível:

1. Acesse: `https://www.npmjs.com/package/@704app/pulse`
2. Ou execute: `npm view @704app/pulse`

## Atualizando o Pacote

Para publicar uma nova versão:

### Opção 1: Atualizar versão manualmente

1. Edite o `package.json` e incremente a versão:
   ```json
   "version": "0.1.1"
   ```

2. Build e publique:
   ```bash
   npm run build
   npm publish --access public
   ```

### Opção 2: Usar npm version (Recomendado)

O npm pode incrementar a versão automaticamente:

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

Isso automaticamente:
- Atualiza o `package.json`
- Cria um commit git (se você estiver em um repositório git)
- Cria uma tag git

Depois, apenas publique:

```bash
npm run build
npm publish --access public
```

## Scripts Úteis

O `package.json` já tem um script `prepublishOnly` que roda automaticamente antes de publicar:

```json
"prepublishOnly": "npm run build"
```

Isso garante que o build sempre está atualizado antes de publicar.

## Troubleshooting

### Erro: "You do not have permission to publish"

- Verifique se você está logado: `npm whoami`
- Verifique se você tem acesso à organização `@704app`
- Se a organização não existe, crie-a no npmjs.com

### Erro: "Package name already exists"

- Alguém já publicou um pacote com esse nome
- Verifique se você tem permissão para atualizar esse pacote
- Ou escolha um nome diferente

### Erro: "You cannot publish over the previously published versions"

- Você está tentando publicar uma versão que já existe
- Incremente a versão no `package.json`

### Publicar versão beta/alpha

Para publicar uma versão de pré-lançamento:

```bash
npm version prerelease --preid=beta
npm run build
npm publish --access public --tag beta
```

Para instalar a versão beta:
```bash
npm install @704app/pulse@beta
```

## Checklist Antes de Publicar

- [ ] Build executado com sucesso (`npm run build`)
- [ ] Versão atualizada no `package.json`
- [ ] **Pacote testado localmente** (usando `npm link` ou `npm pack`)
- [ ] **Testado em Node.js (ESM e CommonJS)**
- [ ] **Testado no Browser** (se aplicável)
- [ ] **Todas as funcionalidades testadas e funcionando**
- [ ] README atualizado
- [ ] Login no npm verificado (`npm whoami`)
- [ ] Acesso à organização verificado
- [ ] `npm pack` verificado e conteúdo inspecionado

## Comandos Rápidos

```bash
# Login
npm login

# Build
npm run build

# Testar localmente (escolha um método)
npm link                    # No diretório do pacote
npm link @704app/pulse      # No projeto de teste

# OU
npm pack                    # Criar .tgz
npm install ./704app-pulse-0.1.0.tgz  # No projeto de teste

# Verificar o que será publicado
npm pack

# Publicar
npm publish --access public

# Atualizar versão e publicar
npm version patch && npm run build && npm publish --access public
```

## Links Úteis

- [Documentação oficial do npm sobre publicação](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Criar organização no npm](https://docs.npmjs.com/creating-and-managing-organizations)
- [Gerenciar versões](https://docs.npmjs.com/cli/v8/commands/npm-version)
