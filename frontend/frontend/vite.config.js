// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts'))              return 'vendor-recharts';
          if (id.includes('@mui/icons-material'))   return 'vendor-mui-icons';
          if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@emotion')) return 'vendor-mui';
          if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor-redux';
          if (id.includes('react-router-dom') || id.includes('react-dom') || (id.includes('react') && !id.includes('recharts'))) return 'vendor-react';
          if (id.includes('axios'))                 return 'vendor-axios';
          if (id.includes('node_modules'))          return 'vendor-misc';
        },
      },
    },
  },
});