# ET21 — Escuela Técnica Nº 21 "Fragata Libertad"

Sitio institucional de la ET Nº 21 D.E. 10. Astro + Tailwind + Cloudflare Pages.

## Stack

- **Astro 4** — generador de sitios estáticos, HTML server-rendered (SEO-first)
- **Tailwind CSS 3** — utility-first styling
- **Cloudflare Pages** — hosting edge gratuito
- **TypeScript strict**

## Desarrollo local

Requiere Node 20+.

```bash
npm install
npm run dev     # http://localhost:4321
```

## Build

```bash
npm run build   # sale a ./dist
npm run preview # sirve el build local
```

## Estructura

```
public/           # assets estáticos (imágenes, logo, robots.txt, _headers)
  logo.png
  images/         # fotos del edificio
  _headers        # headers HTTP para Cloudflare Pages
  robots.txt
  index.html      # home (mockup inicial — a migrar a Astro por página)
src/
  pages/          # rutas de Astro (.astro files)
    404.astro     # página 404
tailwind.config.mjs
astro.config.mjs
```

## Deploy en Cloudflare Pages

1. Conectar el repo en dash.cloudflare.com → Pages → Create project → Connect to Git
2. Configuración de build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory (advanced):** `/` (vacío)
   - **Environment variables:** `NODE_VERSION=20`
3. Deploy automático en cada push a `main`

## Roadmap de migración

El `public/index.html` actual es el mockup multi-página con routing por hash. El próximo paso es migrarlo a páginas Astro individuales:

- [ ] `src/pages/index.astro` (home)
- [ ] `src/pages/inscripcion-2026.astro`
- [ ] `src/pages/carreras/maestro-mayor-de-obras.astro`
- [ ] `src/pages/carreras/tecnico-en-computacion.astro`
- [ ] `src/pages/carreras/nocturno-adultos.astro`
- [ ] `src/pages/institucional.astro`
- [ ] `src/pages/alumnos.astro`
- [ ] `src/pages/contacto.astro`
- [ ] `src/pages/blog/index.astro`
- [ ] `src/pages/blog/[slug].astro` (con content collection)
- [ ] Layout compartido con nav + footer
- [ ] Componentes reutilizables (Hero, PathCard, Carrera, FAQ, Trust, etc.)
- [ ] Sitemap XML automático (`@astrojs/sitemap`)
- [ ] Schema.org por página (EducationalOrganization, FAQPage, LocalBusiness)

## Diseño

- Design spec: `docs/superpowers/specs/2026-04-22-et21-redesign-design.md`
- Dirección visual: Institucional Moderno (navy #0B2545 + gold #D4A017 + cream #F8F7F2)
- Tipografía: Inter (cuerpo) + Fraunces italic (acentos)
- Logo: circular azul + dorado, emblema original de la escuela

## Contacto

- Institucional: info@et21.com.ar · (011) 4543-7363
- Dirección: Núñez 3638, CABA
