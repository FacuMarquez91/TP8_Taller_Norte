# TP8 · Laboratorio 01 · Taller Norte

Implementación de la práctica A/B + SEO. Como el esqueleto de v0 requiere acceso, se mantuvo la separación de responsabilidades indicada en el instructivo.

## Requisitos

Node.js 22.13 o posterior. Host con **disco persistente** (SQLite) para conservar los eventos. No desplegar en una plataforma con almacenamiento efímero/serverless sin configurar persistencia.

## Ejecución

```bash
npm install
npm run dev
```

- Landing: http://localhost:3000/practica
- Bitácora: http://localhost:3000/bitacora
- Preview A: http://localhost:3000/practica?preview=a
- Preview B: http://localhost:3000/practica?preview=b

Para producción: `npm run build && npm run start`. Configurar `NEXT_PUBLIC_SITE_URL=https://tu-dominio` para canonical absoluto y `EXPERIMENT_DB_PATH` a una ruta de disco persistente.

## Diseño

- `proxy.ts`: cookie de visitante y variante (30 días); hash FNV-1a; sesión 30 min; impresión una sola vez por sesión. Control A para crawlers sin cookie. Las URL preview no se contabilizan y no cambian cookies.
- `lib/experiment.ts`: mensajes, oferta, hash, datos fijos y fórmulas.
- `lib/events.ts`: SQLite con restricciones UNIQUE por sesión y por visitante. No se usa localStorage.
- `app/practica/page.tsx`: metadatos SSR, canonical único, `noindex` para preview.
- `app/practica/actions.ts`: conversión desde el CTA, una por visitante.
- `app/bitacora/page.tsx`: métricas reales persistidas y caso fijo independiente.

## Comprobación

`npm test` valida estabilidad del hash, cálculo de tasas y rangos de copy. El navegador debe comprobar también las cookies y metadatos HTML siguiendo el instructivo.

No se incluyen claves ni archivos de base de datos en el repositorio. La aplicación no necesita un formulario real: la escuela es ficticia.
