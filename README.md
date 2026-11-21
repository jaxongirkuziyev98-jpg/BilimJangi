# BilimJang — 1v1 ta'limiy bellashuv

Real vaqtdagi 1v1 ta'limiy bellashuv o'yini: 9 ta fan, 4 xil mini-o'yin
(Fan jangi, Arqon tortish, Poyga, Tezkor javob). Til: O'zbek / Русский / English.

## Ishga tushirish

Kerak: Node.js 20+

```bash
npm install
npm run dev
```

Brauzerda http://localhost:3000 manzilini oching. Ikkinchi o'yinchi sifatida
boshqa oyna (yoki qurilma) orqali xona kodi bilan kiring.

## Production

```bash
npm run build
npm start
```

## Tuzilma

- `server.ts` — Express + Socket.IO + Vite
- `src/server/gameServer.ts` — o'yin mantiqi (xonalar, taymer, javoblar)
- `src/shared/` — umumiy turlar va savollar bazasi
- `src/pages/`, `src/components/` — interfeys
- `src/i18n/translations.ts` — tarjimalar (uz / ru / en)
# BilimJangi
