'use strict';

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/core.js
var _endpoint, _app, _groupId, _initialized, _PulseCore_instances, send_fn, normalizeError_fn, listenNodeErrors_fn, listenBrowserErrors_fn, interceptConsole_fn;
var PulseCore = class {
  constructor() {
    __privateAdd(this, _PulseCore_instances);
    __privateAdd(this, _endpoint, "https://api-pulse.704app.com.br/logs");
    __privateAdd(this, _app);
    __privateAdd(this, _groupId);
    __privateAdd(this, _initialized, false);
  }
  /* =======================
   * INIT
   * ======================= */
  init(config) {
    if (__privateGet(this, _initialized)) return;
    __privateSet(this, _app, config.app);
    __privateSet(this, _groupId, config.groupId);
    if (typeof window === "undefined") {
      __privateMethod(this, _PulseCore_instances, listenNodeErrors_fn).call(this);
      console.log("[Pulse] \u2705 Inicializado para Node.js");
    } else {
      __privateMethod(this, _PulseCore_instances, listenBrowserErrors_fn).call(this);
      console.log("[Pulse] \u2705 Inicializado para Browser");
    }
    __privateMethod(this, _PulseCore_instances, interceptConsole_fn).call(this);
    __privateSet(this, _initialized, true);
    console.log(`[Pulse] Configurado: app="${__privateGet(this, _app)}", groupId="${__privateGet(this, _groupId)}"`);
  }
  initFromEnv() {
    if (typeof process === "undefined") return;
    const app = process.env.PULSE_APP;
    const groupId = process.env.PULSE_GROUP;
    if (!app || !groupId) return;
    this.init({ app, groupId });
  }
  /* =======================
   * PUBLIC MANUAL LOG
   * ======================= */
  emergency(error, context = "manual.emergency") {
    __privateMethod(this, _PulseCore_instances, send_fn).call(this, "emergency", error, context);
  }
};
_endpoint = new WeakMap();
_app = new WeakMap();
_groupId = new WeakMap();
_initialized = new WeakMap();
_PulseCore_instances = new WeakSet();
/* =======================
 * CORE SEND
 * ======================= */
send_fn = function(type, error, context) {
  if (!__privateGet(this, _app) || !__privateGet(this, _groupId)) {
    console.warn("[Pulse] N\xE3o inicializado. Chame Pulse.init() primeiro.");
    return;
  }
  const normalizedError = __privateMethod(this, _PulseCore_instances, normalizeError_fn).call(this, error);
  let errorContext = normalizedError.stack || "";
  if (!errorContext) {
    if (normalizedError.name && normalizedError.message) {
      errorContext = `${normalizedError.name}: ${normalizedError.message}`;
    } else if (normalizedError.message) {
      errorContext = normalizedError.message;
    } else {
      errorContext = String(error);
    }
  }
  let messageParts = [];
  if (normalizedError.name) {
    messageParts.push(`Error: ${normalizedError.name}`);
  }
  if (normalizedError.message) {
    messageParts.push(`Message: ${normalizedError.message}`);
  } else {
    messageParts.push(`Message: ${String(error)}`);
  }
  if (context) {
    messageParts.push(`Source: ${context}`);
  }
  let message = messageParts.join("\n");
  if (normalizedError.stack) {
    message = `${message}

Stack Trace:
${normalizedError.stack}`;
  }
  const payload = {
    type,
    groupId: __privateGet(this, _groupId),
    app: __privateGet(this, _app),
    message,
    context: errorContext
    // SEMPRE preenchido com stack ou fallback
  };
  if (!payload.context || payload.context.trim() === "") {
    payload.context = "No stack trace available";
  }
  console.log(`[Pulse] Enviando log: ${type} - ${context || "sem contexto"}`);
  fetch(__privateGet(this, _endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(async (response) => {
    if (response.ok) {
      console.log(`[Pulse] \u2705 Log enviado com sucesso: ${type} - ${context || "sem contexto"}`);
    } else {
      const errorText = await response.text().catch(() => "");
      console.error(`[Pulse] \u274C Erro ao enviar log: ${response.status} ${response.statusText}`);
      console.error(`[Pulse] Resposta: ${errorText}`);
    }
  }).catch((err) => {
    console.error("[Pulse] \u274C Erro na requisi\xE7\xE3o:", err.message);
  });
};
normalizeError_fn = function(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
  }
  if (Array.isArray(error)) {
    const messages = error.map((item) => {
      if (item instanceof Error) {
        return `[${item.name}] ${item.message}${item.stack ? "\n" + item.stack : ""}`;
      }
      if (typeof item === "object" && item !== null) {
        try {
          return JSON.stringify(item, null, 2);
        } catch {
          return String(item);
        }
      }
      return String(item);
    });
    return {
      message: messages.join(" "),
      name: "MultipleErrors",
      stack: null
    };
  }
  if (typeof error === "object" && error !== null) {
    try {
      const stringified = JSON.stringify(error, null, 2);
      return {
        message: stringified,
        name: error.constructor?.name || "Object",
        stack: null
      };
    } catch {
      return {
        message: "[Unserializable object]",
        name: "Unserializable",
        stack: null
      };
    }
  }
  return {
    message: String(error),
    name: typeof error,
    stack: null
  };
};
/* =======================
 * NODE HANDLERS
 * ======================= */
listenNodeErrors_fn = function() {
  console.log("[Pulse] Registrando handlers de erro do Node.js...");
  process.on("uncaughtException", (error) => {
    console.error("[Pulse] \u26A0\uFE0F  Capturando uncaughtException:", error.message);
    __privateMethod(this, _PulseCore_instances, send_fn).call(this, "critical", error, "uncaughtException");
    setTimeout(() => {
      process.exit(1);
    }, 2e3);
  });
  process.on("unhandledRejection", (reason, promise) => {
    const errorMessage = reason instanceof Error ? reason.message : String(reason);
    console.error("[Pulse] \u26A0\uFE0F  Capturando unhandledRejection:", errorMessage);
    __privateMethod(this, _PulseCore_instances, send_fn).call(this, "critical", reason, "unhandledRejection");
  });
  process.on("warning", (warning) => {
    if (warning.name === "UnhandledPromiseRejectionWarning") {
      console.warn("[Pulse] Aviso de Promise rejeitada detectado");
    }
  });
};
/* =======================
 * BROWSER HANDLERS
 * ======================= */
listenBrowserErrors_fn = function() {
  window.addEventListener("error", (event) => {
    __privateMethod(this, _PulseCore_instances, send_fn).call(this, "critical", event.error ?? event.message, "window.error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    __privateMethod(this, _PulseCore_instances, send_fn).call(this, "critical", event.reason, "unhandledRejection");
  });
};
/* =======================
 * CONSOLE INTERCEPT
 * ======================= */
interceptConsole_fn = function() {
  const original = console.error.bind(console);
  let isSending = false;
  console.error = (...args) => {
    if (!isSending) {
      isSending = true;
      try {
        let errorToSend = null;
        for (const arg of args) {
          if (arg instanceof Error) {
            errorToSend = arg;
            break;
          }
        }
        if (!errorToSend) {
          const message = args.map((arg) => {
            if (typeof arg === "object" && arg !== null) {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(" ");
          errorToSend = new Error(message);
          Error.captureStackTrace?.(errorToSend, console.error);
        }
        __privateMethod(this, _PulseCore_instances, send_fn).call(this, "error", errorToSend, "console.error");
      } catch (err) {
        original("[Pulse] Erro ao interceptar console.error:", err);
      } finally {
        isSending = false;
      }
    }
    original(...args);
  };
};
var Pulse = new PulseCore();

// src/auto.js
Pulse.initFromEnv();
//# sourceMappingURL=auto.cjs.map
//# sourceMappingURL=auto.cjs.map