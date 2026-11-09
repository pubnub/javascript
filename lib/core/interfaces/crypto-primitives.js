"use strict";
/**
 * Platform-specific cryptographic primitives.
 *
 * Core SDK code doesn't depend on any concrete crypto implementation. Each platform entry point injects
 * primitives backed by the native crypto available on it (`crypto.subtle`, `node:crypto` or `@noble/*`).
 */
Object.defineProperty(exports, "__esModule", { value: true });
