import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  
  // On Vercel, process.env is populated with system variables.
  // Locally, loadEnv populates from .env files.
  // We use a fallback strategy.
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Stringify the key to inject it as a string literal into the bundle
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  }
})