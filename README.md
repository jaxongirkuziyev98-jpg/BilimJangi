# BilimJang — 1v1 Ta'limiy Bellashuv

Real vaqtdagi 1v1 ta'limiy bellashuv o'yini (Vite + React + Express + Socket.IO + Gemini AI).

## Lokal ishga tushirish

1. Kutubxonalarni o'rnating:
   ```bash
   npm install
   ```
2. `.env.example` dan nusxa olib `.env` fayl yarating va `GEMINI_API_KEY` ni kiriting.
3. Loyihani ishga tushiring:
   ```bash
   npm run dev
   ```

## Render.com ga joylash (Deploy)

1. Loyihani GitHub repozitoriyga yuklang.
2. Render Dashboard'da **New + -> Web Service** ni tanlang.
3. Sozlamalar:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** `GEMINI_API_KEY` (va ixtiyoriy `NODE_ENV=production`)
