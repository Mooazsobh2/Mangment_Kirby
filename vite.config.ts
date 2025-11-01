import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 💡 الحل: يجب أن تبدأ بـ '/' فقط (بدون النقطة ./ )
  base: "/Kirby3/", 
})
