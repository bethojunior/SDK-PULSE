/**
 * Arquivo de exemplo para testar o pacote @704app/pulse localmente
 * 
 * Como usar:
 * 1. No diretório do pacote: npm run build && npm link
 * 2. Neste diretório: npm link @704app/pulse
 * 3. Execute: node test-example.js
 */

import { Pulse } from '@704app/pulse';

console.log('🧪 Iniciando testes do @704app/pulse\n');

// Teste 1: Inicialização manual
console.log('Teste 1: Inicialização manual');
try {
  Pulse.init({
    app: 'test-app',
    groupId: 'test-group'
  });
  console.log('✅ Inicialização OK\n');
} catch (error) {
  console.error('❌ Erro na inicialização:', error);
  process.exit(1);
}

// Teste 2: Log manual de emergência
console.log('Teste 2: Log manual de emergência');
try {
  const testError = new Error('Erro de teste manual');
  Pulse.emergency(testError, 'test.manual');
  console.log('✅ Log manual enviado\n');
} catch (error) {
  console.error('❌ Erro no log manual:', error);
}

// Teste 3: Verificar se o Pulse está capturando erros
console.log('Teste 3: Verificando captura automática de erros');
console.log('⚠️  Os próximos erros serão capturados automaticamente pelo Pulse\n');

// Teste 4: Erro não tratado (será capturado automaticamente após 2 segundos)
setTimeout(() => {
  console.log('Teste 4: Lançando erro não tratado...');
  throw new Error('Erro não tratado de teste - deve ser capturado pelo Pulse');
}, 2000);

// Teste 5: Promise rejeitada (será capturada automaticamente)
setTimeout(() => {
  console.log('Teste 5: Rejeitando promise...');
  Promise.reject(new Error('Promise rejeitada de teste - deve ser capturada pelo Pulse'));
}, 3000);

// Teste 6: console.error (será interceptado)
setTimeout(() => {
  console.log('Teste 6: Testando console.error...');
  console.error('Este console.error deve ser interceptado pelo Pulse');
}, 4000);

// Teste 7: Inicialização com variáveis de ambiente (Node.js apenas)
if (typeof process !== 'undefined') {
  console.log('Teste 7: Inicialização com variáveis de ambiente');
  process.env.PULSE_APP = 'env-test-app';
  process.env.PULSE_GROUP = 'env-test-group';
  
  // Criar uma nova instância para testar initFromEnv
  // Nota: Como Pulse é um singleton, isso não funcionará completamente
  // Mas serve para verificar se o método existe
  if (typeof Pulse.initFromEnv === 'function') {
    console.log('✅ Método initFromEnv disponível\n');
  } else {
    console.log('❌ Método initFromEnv não encontrado\n');
  }
}

console.log('⏳ Aguardando 5 segundos para verificar captura automática de erros...');
console.log('💡 Verifique se os erros foram enviados para a API do Pulse\n');

// Finalizar após 5 segundos
setTimeout(() => {
  console.log('\n✅ Testes concluídos!');
  console.log('📝 Verifique se os logs foram enviados para: https://api-pulse.704app.com.br/logs');
  process.exit(0);
}, 5000);
