import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['docx', 'file-saver', '@reduxjs/toolkit', 'react-redux', 'react-router-dom'],
  },
});
