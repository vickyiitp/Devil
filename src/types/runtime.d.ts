// Type declaration for the global runtime configuration object
export {};

declare global {
  interface Window {
    __API_URL?: string;
  }
}
