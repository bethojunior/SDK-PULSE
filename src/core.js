class PulseCore {
  #endpoint = 'https://injest-pulse.704app.com.br/logs'
  #app
  #groupId
  #initialized = false

  /* =======================
   * INIT
   * ======================= */
  init(config) {
    if (this.#initialized) return

    this.#app = config.app
    this.#groupId = config.groupId

    if (typeof window === 'undefined') {
      this.#listenNodeErrors()
      console.log('[Pulse] ✅ Inicializado para Node.js')
    } else {
      this.#listenBrowserErrors()
      console.log('[Pulse] ✅ Inicializado para Browser')
    }

    this.#interceptConsole()
    this.#initialized = true
    console.log(`[Pulse] Configurado: app="${this.#app}", groupId="${this.#groupId}"`)
  }

  initFromEnv() {
    if (typeof process === 'undefined') return

    const app = process.env.PULSE_APP
    const groupId = process.env.PULSE_GROUP

    if (!app || !groupId) return

    this.init({ app, groupId })
  }

  /* =======================
   * PUBLIC MANUAL LOG
   * ======================= */
  emergency(error, context = 'manual.emergency') {
    this.#send('emergency', error, context)
  }

  /* =======================
   * CORE SEND
   * ======================= */
  #send(type, error, context) {
    if (!this.#app || !this.#groupId) {
      console.warn('[Pulse] Não inicializado. Chame Pulse.init() primeiro.')
      return
    }

    // Normalizar o erro para obter informações detalhadas
    const normalizedError = this.#normalizeError(error)
    
    // Contexto SEMPRE deve ser o stack do erro, nunca nulo
    let errorContext = normalizedError.stack || ''
    
    // Se não houver stack, criar um contexto baseado no erro
    if (!errorContext) {
      if (normalizedError.name && normalizedError.message) {
        errorContext = `${normalizedError.name}: ${normalizedError.message}`
      } else if (normalizedError.message) {
        errorContext = normalizedError.message
      } else {
        errorContext = String(error)
      }
    }
    
    // Construir mensagem precisa com informações do erro
    let messageParts = []
    
    // Adicionar tipo de erro e nome se disponível
    if (normalizedError.name) {
      messageParts.push(`Error: ${normalizedError.name}`)
    }
    
    // Adicionar mensagem do erro
    if (normalizedError.message) {
      messageParts.push(`Message: ${normalizedError.message}`)
    } else {
      messageParts.push(`Message: ${String(error)}`)
    }
    
    // Adicionar contexto original se fornecido (apenas como informação adicional)
    if (context) {
      messageParts.push(`Source: ${context}`)
    }
    
    // Construir mensagem final
    let message = messageParts.join('\n')
    
    // Incluir stack na mensagem se disponível
    if (normalizedError.stack) {
      message = `${message}\n\nStack Trace:\n${normalizedError.stack}`
    }

    // Formato esperado pela API - contexto SEMPRE será o stack (nunca nulo)
    const payload = {
      type,
      groupId: this.#groupId,
      app: this.#app,
      message,
      context: errorContext // SEMPRE preenchido com stack ou fallback
    }
    
    // Garantir que context nunca seja nulo ou vazio
    if (!payload.context || payload.context.trim() === '') {
      payload.context = 'No stack trace available'
    }

    console.log(`[Pulse] Enviando log: ${type} - ${context || 'sem contexto'}`)

    fetch(this.#endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        if (response.ok) {
          console.log(`[Pulse] ✅ Log enviado com sucesso: ${type} - ${context || 'sem contexto'}`)
        } else {
          const errorText = await response.text().catch(() => '')
          console.error(`[Pulse] ❌ Erro ao enviar log: ${response.status} ${response.statusText}`)
          console.error(`[Pulse] Resposta: ${errorText}`)
        }
      })
      .catch((err) => {
        console.error('[Pulse] ❌ Erro na requisição:', err.message)
      })
  }

  #normalizeError(error) {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    }

    // Se for um array (como do console.error), processar cada item
    if (Array.isArray(error)) {
      const messages = error.map(item => {
        if (item instanceof Error) {
          return `[${item.name}] ${item.message}${item.stack ? '\n' + item.stack : ''}`
        }
        if (typeof item === 'object' && item !== null) {
          try {
            return JSON.stringify(item, null, 2)
          } catch {
            return String(item)
          }
        }
        return String(item)
      })
      return {
        message: messages.join(' '),
        name: 'MultipleErrors',
        stack: null
      }
    }

    if (typeof error === 'object' && error !== null) {
      try {
        const stringified = JSON.stringify(error, null, 2)
        return { 
          message: stringified,
          name: error.constructor?.name || 'Object',
          stack: null
        }
      } catch {
        return { 
          message: '[Unserializable object]',
          name: 'Unserializable',
          stack: null
        }
      }
    }

    return { 
      message: String(error),
      name: typeof error,
      stack: null
    }
  }

  /* =======================
   * NODE HANDLERS
   * ======================= */
  #listenNodeErrors() {
    console.log('[Pulse] Registrando handlers de erro do Node.js...')
    
    process.on('uncaughtException', (error) => {
      console.error('[Pulse] ⚠️  Capturando uncaughtException:', error.message)
      this.#send('critical', error, 'uncaughtException')
      // Não encerra o processo imediatamente para dar tempo de enviar o log
      setTimeout(() => {
        process.exit(1)
      }, 2000)
    })

    process.on('unhandledRejection', (reason, promise) => {
      const errorMessage = reason instanceof Error ? reason.message : String(reason)
      console.error('[Pulse] ⚠️  Capturando unhandledRejection:', errorMessage)
      this.#send('critical', reason, 'unhandledRejection')
    })
    
    // Garantir que avisos de unhandledRejection sejam mostrados
    process.on('warning', (warning) => {
      if (warning.name === 'UnhandledPromiseRejectionWarning') {
        console.warn('[Pulse] Aviso de Promise rejeitada detectado')
      }
    })
  }

  /* =======================
   * BROWSER HANDLERS
   * ======================= */
  #listenBrowserErrors() {
    window.addEventListener('error', (event) => {
      this.#send('critical', event.error ?? event.message, 'window.error')
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.#send('critical', event.reason, 'unhandledRejection')
    })
  }

  /* =======================
   * CONSOLE INTERCEPT
   * ======================= */
  #interceptConsole() {
    const original = console.error.bind(console)
    let isSending = false // Flag para evitar loops infinitos

    console.error = (...args) => {
      // Evitar loop infinito se o próprio send gerar um console.error
      if (!isSending) {
        isSending = true
        try {
          // Encontrar o primeiro Error nos argumentos, se houver
          let errorToSend = null
          for (const arg of args) {
            if (arg instanceof Error) {
              errorToSend = arg
              break
            }
          }
          
          // Se não encontrou Error, criar um com a mensagem
          if (!errorToSend) {
            const message = args
              .map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                  try {
                    return JSON.stringify(arg)
                  } catch {
                    return String(arg)
                  }
                }
                return String(arg)
              })
              .join(' ')
            errorToSend = new Error(message)
            // Adicionar stack trace artificial
            Error.captureStackTrace?.(errorToSend, console.error)
          }
          
          this.#send('error', errorToSend, 'console.error')
        } catch (err) {
          // Se der erro ao enviar, apenas logar sem interceptar novamente
          original('[Pulse] Erro ao interceptar console.error:', err)
        } finally {
          isSending = false
        }
      }
      
      // Sempre chamar o console.error original
      original(...args)
    }
  }
}

export const Pulse = new PulseCore()
