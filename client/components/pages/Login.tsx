'use client';

// Re-export the Login page from the copied src
// The original Login.tsx is large (35KB) — copy it here with 'use client' prepended
// The actual Login component content is in the copied file below.
// We just add the directive and fix any router imports.

export { default } from './LoginContent';