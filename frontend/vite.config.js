// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(), react()],
//   server: {
//     headers: {
//     "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
//   },
//     proxy: {
//       '/login': {
//         target: '${import.meta.env.VITE_API_URL}',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path.replace(/^\/login/, '')
//       }
//     }
//   }
// });         
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

