import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: [
            'ag-agrow.trycloudflare.com',
            'tayna-feirie-xuan.ngrok-free.dev',
            'portfolio-favorites-holder-wrote.trycloudflare.com',
            'critics-weekly-depends-qualifications.trycloudflare.com/'
        ],
        proxy: {
            '/api': {
                target: 'https://braided-constrained-maximilian.ngrok-free.dev',
                changeOrigin: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            },
            '/uploads': {
                target: 'https://braided-constrained-maximilian.ngrok-free.dev',
                changeOrigin: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            }
        }
    }
})
