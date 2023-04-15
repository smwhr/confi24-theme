import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), resolve({
    browser: true,
    preferBuiltins: false, // new!
  }), json()],
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {},
    resolve: {
        alias: {
          './runtimeConfig': './runtimeConfig.browser',
        }
    }
  },
})
