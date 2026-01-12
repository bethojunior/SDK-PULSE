export interface PulseInitConfig {
  app: string
  groupId: string
}

export declare class PulseCore {
  init(config: PulseInitConfig): void
  initFromEnv(): void

  emergency(error: unknown, context?: string): void
}

export declare const Pulse: PulseCore
