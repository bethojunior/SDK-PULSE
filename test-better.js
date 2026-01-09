/**
 * Teste melhorado para o @704app/pulse
 * 
 * IMPORTANTE: Erros lançados dentro de setTimeout podem não ser capturados
 * como uncaughtException no Node.js. Use este arquivo para testar corretamente.
 */

import { Pulse } from '@704app/pulse';

console.log('🧪 Iniciando testes do @704app/pulse\n');

// Teste 1: Inicialização manual
console.log('Teste 1: Inicialização manual');
Pulse.init({
  app: 'npm-app',
  groupId: '311bedb1-0ad3-4a73-9b79-3e303802f1b9'
});
console.log('✅ Inicialização OK\n');

// Teste 2: Log manual
console.log('Teste 2: Log manual');
try {
  throw new Error('Erro de teste manual');
} catch (error) {
  Pulse.emergency(error, 'test.context');
  console.log('✅ Log manual enviado\n');
}

// Teste 3: Promise rejeitada (será capturada automaticamente)
console.log('Teste 3: Promise rejeitada');
Promise.reject(new Error('Promise rejeitada de teste'));
console.log('✅ Promise rejeitada criada (deve ser capturada)\n');

// Teste 4: Erro não tratado FORA de setTimeout (será capturado)
console.log('Teste 4: Erro não tratado (fora de setTimeout)');
console.log('⚠️  Este erro vai encerrar o processo após 2 segundos\n');

// Aguardar um pouco antes de lançar o erro
setTimeout(() => {
  // Este erro será capturado, mas o processo será encerrado
  throw new Error('Erro não tratado de teste - será capturado pelo Pulse');
}, 2000);

// Teste 5: console.error (será interceptado)
console.log('Teste 5: console.error (será interceptado)');
setTimeout(() => {
  console.error('Este console.error deve ser interceptado pelo Pulse');
}, 1000);

console.log('\n⏳ Aguardando 5 segundos para verificar captura automática...');
console.log('💡 Observe os logs [Pulse] para ver o que está sendo capturado\n');

// Manter o processo vivo por 5 segundos
setTimeout(() => {
  console.log('\n✅ Testes concluídos!');
  console.log('📝 Verifique os logs [Pulse] acima para confirmar que os erros foram capturados');
  console.log('🌐 Verifique se os logs foram enviados para: https://api-pulse.704app.com.br/logs');
  process.exit(0);
}, 5000);
