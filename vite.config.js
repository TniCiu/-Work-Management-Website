import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  base: './',  // Sửa từ '/' thành './' để đảm bảo file tĩnh được load đúng
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  plugins: [
    react(),
    svgr()
  ],
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
