/**
 * Teste realista do @704app/pulse
 * Simula situações reais de uso
 */

import { Pulse } from '@704app/pulse'

// Teste 1: Inicialização manual
console.log('Teste 1: Inicialização manual')
Pulse.init({
  app: 'npm-app',
  groupId: '311bedb1-0ad3-4a73-9b79-3e303802f1b9'
})
console.log('✅ Inicialização OK\n')

// Teste 2: Log manual
console.log('Teste 2: Log manual')
try {
  throw new Error('Erro de teste')
} catch (error) {
  Pulse.emergency(error, 'test.context')
  console.log('✅ Log manual OK\n')
}

// Teste 3: Erro não tratado (será capturado automaticamente)
console.log('Teste 3: Erro não tratado')
setTimeout(() => {
  throw new Error('Erro não tratado de teste')
}, 1000)

// Teste 4: Promise rejeitada (será capturada automaticamente)
console.log('Teste 4: Promise rejeitada')
Promise.reject(new Error('Promise rejeitada de teste'))

console.log('Todos os testes iniciados. Aguarde alguns segundos...\n')

// Manter o processo vivo para ver os resultados
setTimeout(() => {
  console.log('\n✅ Testes concluídos!')
  console.log('📝 Verifique os logs [Pulse] acima')
  console.log('🌐 Verifique se os logs foram enviados para a API')
  process.exit(0)
}, 5000)
