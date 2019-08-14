/* eslint-disable @typescript-eslint/no-explicit-any */

const globals: Record<string, any> = {};

export function sendToGlobals(variables: Record<string, any>): void {
  Object.assign(globals, variables);
}

declare global {
  interface Window {
    d: any;
  }
}

if (process.env.NODE_ENV === 'development') {
  window.d = globals;
}
