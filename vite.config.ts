import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
  'process.env.SF_API_KEY': JSON.stringify(env.SF_API_KEY),
  'process.env.SF_MODEL': JSON.stringify('Qwen/Qwen2.5-7B-Instruct') // 这里改回通义千问
},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
