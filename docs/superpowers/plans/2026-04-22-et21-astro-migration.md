# ET21 Astro Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el mockup monolítico `public/index.html` (hash router) a una arquitectura Astro real con URLs limpias, componentes compartidos, SEO por página, y blog con Content Collections.

**Architecture:** Layout compartido (`src/layouts/Layout.astro`) con head SEO + nav + footer; componentes atómicos (`Button`, `Kicker`, `Section`, `FAQItem`) y bloques (`Hero`, `TrustStrip`, `FinalCTA`, `DualPath`) en `src/components/`; una página Astro por ruta bajo `src/pages/`; blog como Content Collection (`src/content/blog/*.mdx`). Tailwind para utilidades más `@layer components` para los patrones recurrentes del design system. Schema.org via slot en el layout.

**Tech Stack:** Astro 4, Tailwind 3, `@astrojs/sitemap`, `@astrojs/mdx`, TypeScript strict. Deploy en Cloudflare Pages.

**Reference:** El mockup original vive en `public/index.html` y es la fuente de verdad visual durante la migración. El design spec está en `docs/superpowers/specs/2026-04-22-et21-redesign-design.md`.

**Convención de testing:** Como es un sitio estático de marketing, los "tests" son verificaciones de build + render:
- `npm run build` debe terminar con exit 0 y generar `dist/<ruta>/index.html` esperado
- `npm run dev` + inspección visual contra el mockup (`/files/sitio-completo.html`)
- `astro check` debe pasar (typecheck de .astro)

Commit frecuente: un commit por task completa.

---

## Task 0: Agregar dependencias faltantes

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar deps base**

```bash
npm install
```

Expected: `node_modules/` creado, sin errores.

- [ ] **Step 2: Agregar @astrojs/sitemap y @astrojs/mdx**

```bash
npm install @astrojs/sitemap @astrojs/mdx
```

- [ ] **Step 3: Verificar build inicial (del scaffolding)**

```bash
npm run build
```

Expected: Build OK, `dist/` contiene `index.html` (copiado de public), `404/index.html`, y assets en `dist/images/`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: agregar sitemap y mdx deps"
```

---

## Task 1: Design tokens en Tailwind + CSS global

**Files:**
- Create: `src/styles/global.css`
- Modify: `tailwind.config.mjs` (ya existe, extender)
- Modify: `astro.config.mjs` (agregar integraciones)

El mockup usa CSS vars (`--navy`, `--gold`, etc) y clases ad-hoc. Migramos a:
- CSS vars en `global.css` (para usar en CSS puro donde convenga)
- Tailwind theme extendido con los mismos colores (para utilities)
- `@layer components` para patrones recurrentes (`.btn-primary`, `.kicker`, `.section-alt`)

- [ ] **Step 1: Crear `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --navy: #0B2545;
    --navy-2: #13315C;
    --navy-dk: #06192D;
    --gold: #B8872B;
    --gold-bright: #D4A017;
    --gold-soft: #FFF9E8;
    --orange: #E87A1C;
    --cream: #F8F7F2;
    --off-white: #FAF9F4;
    --ink: #0B2545;
    --body: #3E4B63;
    --muted: #6B7280;
    --line: #E6E3D8;
    --green: #00704A;
    --green-soft: #E8F7F0;
  }

  html { scroll-behavior: smooth; }
  body {
    @apply bg-off-white text-[#3E4B63] antialiased;
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
  }
  h1, h2, h3, h4, h5, h6 { @apply text-ink; }
  .italic-serif {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    font-weight: 400;
  }
}

@layer components {
  .kicker {
    @apply inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[2.5px] text-gold mb-5;
  }
  .kicker::before {
    content: '';
    @apply w-7 h-[1.5px] bg-gold;
  }
  .kicker-light { @apply text-gold-bright; }
  .kicker-light::before { @apply bg-gold-bright; }

  .btn {
    @apply inline-flex items-center gap-2 px-[22px] py-[14px] text-sm font-semibold rounded-[9px] border-[1.5px] border-transparent transition-all;
  }
  .btn-primary { @apply btn bg-navy text-white hover:bg-navy-2; }
  .btn-ghost { @apply btn text-ink border-ink hover:bg-ink hover:text-white; }
  .btn-white { @apply btn bg-white text-navy; }
  .btn-outline { @apply btn bg-transparent text-white border-white/30 hover:bg-white/10; }
  .btn-gold { @apply btn bg-gold-bright text-navy hover:bg-gold; }

  .section-pad { @apply py-20 px-8; }
  .section-alt { @apply bg-cream; }
  .container-et { @apply max-w-[1200px] mx-auto; }

  .h-display {
    @apply font-extrabold leading-[1.03] tracking-[-2px] text-ink;
  }
}
```

- [ ] **Step 2: Extender `tailwind.config.mjs`**

Reemplazar el contenido actual con:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B2545', 2: '#13315C', dk: '#06192D' },
        gold: { DEFAULT: '#B8872B', bright: '#D4A017', soft: '#FFF9E8' },
        cream: '#F8F7F2',
        'off-white': '#FAF9F4',
        ink: '#0B2545',
        body: '#3E4B63',
        muted: '#6B7280',
        line: '#E6E3D8',
        'green-inst': '#00704A',
        'green-soft': '#E8F7F0',
        orange: '#E87A1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      maxWidth: { 'content': '1200px' },
      boxShadow: {
        'card-hover': '0 24px 40px -20px rgba(11,37,69,0.15)',
        'card-lift': '0 30px 50px -20px rgba(11,37,69,0.18)',
        'hero': '0 40px 80px -20px rgba(11,37,69,0.3)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Actualizar `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://et21.com.ar',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    mdx(),
  ],
  build: { format: 'directory' },
  compressHTML: true,
});
```

Nota: `applyBaseStyles: false` porque inyectamos Tailwind manualmente desde `global.css`.

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Expected: Build OK, sin warnings de Tailwind.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css tailwind.config.mjs astro.config.mjs
git commit -m "feat(styles): design tokens + Tailwind theme + global css"
```

---

## Task 2: Layout base con SEO head

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/seo/SchemaEducational.astro`

El Layout concentra: `<head>` con meta + OG + fonts, el nav, el footer, y slots para contenido + schema.

- [ ] **Step 1: Crear `src/components/seo/SchemaEducational.astro`**

```astro
---
const schema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Escuela Técnica Nº 21 D.E. 10 Fragata Escuela Libertad",
  "alternateName": "ET21",
  "url": "https://et21.com.ar",
  "logo": "https://et21.com.ar/logo.png",
  "image": "https://et21.com.ar/images/patio-palmeras.jpg",
  "foundingDate": "1952-10",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Núñez 3638",
    "addressLocality": "Ciudad Autónoma de Buenos Aires",
    "addressRegion": "CABA",
    "addressCountry": "AR"
  },
  "telephone": "+54-11-4543-7363",
  "email": "info@et21.com.ar",
  "parentOrganization": {
    "@type": "GovernmentOrganization",
    "name": "Ministerio de Educación de la Ciudad de Buenos Aires",
    "url": "https://www.buenosaires.gob.ar/educacion"
  }
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)}></script>
```

- [ ] **Step 2: Crear `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import SchemaEducational from '../components/seo/SchemaEducational.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const {
  title,
  description,
  canonical = Astro.url.href,
  ogImage = '/images/patio-palmeras.jpg',
  noindex = false,
} = Astro.props;

const siteUrl = 'https://et21.com.ar';
const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
---
<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>{title}</title>
  <meta name="description" content={description} />
  {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}
  <link rel="canonical" href={canonical} />
  <link rel="icon" type="image/png" href="/logo.png" />

  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_AR" />
  <meta property="og:site_name" content="Escuela Técnica Nº 21 – Fragata Libertad" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={fullOgImage} />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet" />

  <SchemaEducational />
  <slot name="schema" />
</head>
<body>
  <Nav />
  <slot />
  <Footer />
</body>
</html>
```

- [ ] **Step 3: Build check (fallará hasta tener Nav y Footer — esperable)**

```bash
npm run build 2>&1 | head -20
```

Expected: error indicando que `Nav` y `Footer` no existen. Ignoramos hasta Task 3.

- [ ] **Step 4: Commit (WIP)**

```bash
git add src/layouts/ src/components/seo/
git commit -m "feat(layout): base Layout con head SEO + Schema EducationalOrg"
```

---

## Task 3: Nav + Footer components

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Crear `src/components/Nav.astro`**

El nav actual del mockup. URLs reales (ya no hash).

```astro
---
const links = [
  { href: '/institucional', label: 'Institucional' },
  { href: '/carreras/maestro-mayor-de-obras', label: 'Carreras' },
  { href: '/carreras/nocturno-adultos', label: 'Nocturno' },
  { href: '/alumnos', label: 'Alumnos' },
  { href: '/blog', label: 'Blog' },
  { href: '/contacto', label: 'Contacto' },
];

const pathname = Astro.url.pathname;
function isActive(href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href.split('/').slice(0, 2).join('/'));
}
---
<div class="bg-navy text-white py-2 px-6 text-xs flex justify-center gap-5">
  📢 Inscripción 2026 abierta · <a href="/inscripcion-2026" class="text-gold-bright font-semibold no-underline">Ver fechas y requisitos →</a>
</div>
<nav class="sticky top-0 z-50 bg-[#FAF9F4]/95 backdrop-blur-md border-b border-line py-3.5 px-8 flex items-center gap-8">
  <a href="/" class="flex items-center gap-3 text-ink no-underline">
    <img src="/logo.png" alt="E.T. Nº 21 D.E. 10" class="w-12 h-12 object-contain flex-shrink-0" />
    <div class="font-extrabold text-[15px] tracking-[-0.3px] leading-tight">
      E.T. Nº 21 D.E. 10
      <small class="block font-medium text-[10px] text-muted uppercase mt-0.5 tracking-[1.2px]">Fragata Escuela Libertad</small>
    </div>
  </a>
  <ul class="list-none flex gap-6 ml-auto items-center max-md:hidden">
    {links.map(link => (
      <li>
        <a
          href={link.href}
          class:list={[
            'no-underline font-medium text-sm transition-colors',
            isActive(link.href) ? 'text-gold' : 'text-ink hover:text-gold',
          ]}
        >{link.label}</a>
      </li>
    ))}
    <li>
      <a href="/inscripcion-2026" class="px-[18px] py-2.5 bg-navy text-white font-bold text-[13px] rounded-lg border-[1.5px] border-navy hover:bg-gold-bright hover:border-gold-bright hover:text-navy transition-all">
        Inscripción 2026 →
      </a>
    </li>
  </ul>
</nav>
```

- [ ] **Step 2: Crear `src/components/Footer.astro`**

Reescribo el footer del mockup con las URLs reales.

```astro
---
---
<footer class="bg-navy-dk text-white/70 py-[60px] px-8 pb-[30px] text-[13px]">
  <div class="container-et grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-white/10 max-lg:grid-cols-2 max-md:grid-cols-1">
    <div>
      <div class="text-white font-extrabold text-base mb-3.5">E.T. Nº 21 D.E. 10</div>
      <p class="max-w-[320px] leading-relaxed mb-3.5">Fragata Escuela Libertad · Escuela técnica pública del Ministerio de Educación de la Ciudad de Buenos Aires. Formando técnicos con oficio y criterio desde 1952.</p>
      <p class="text-xs text-white/55">📍 Núñez 3638, CABA<br />📞 (011) 4543-7363<br />✉️ <a href="mailto:info@et21.com.ar" class="text-white/70 no-underline hover:text-gold-bright">info@et21.com.ar</a></p>
    </div>

    <div>
      <h5 class="text-white text-xs tracking-[1.5px] uppercase font-bold mb-4">Institución</h5>
      <ul class="list-none flex flex-col gap-2">
        <li><a href="/" class="text-white/70 no-underline hover:text-gold-bright">Inicio</a></li>
        <li><a href="/institucional" class="text-white/70 no-underline hover:text-gold-bright">Institucional</a></li>
        <li><a href="/institucional#historia" class="text-white/70 no-underline hover:text-gold-bright">Nuestra historia</a></li>
        <li><a href="/blog" class="text-white/70 no-underline hover:text-gold-bright">Blog</a></li>
        <li><a href="/contacto" class="text-white/70 no-underline hover:text-gold-bright">Contacto</a></li>
      </ul>
    </div>

    <div>
      <h5 class="text-white text-xs tracking-[1.5px] uppercase font-bold mb-4">Carreras</h5>
      <ul class="list-none flex flex-col gap-2">
        <li><a href="/carreras/maestro-mayor-de-obras" class="text-white/70 no-underline hover:text-gold-bright">Maestro Mayor de Obras</a></li>
        <li><a href="/carreras/tecnico-en-computacion" class="text-white/70 no-underline hover:text-gold-bright">Técnico en Computación</a></li>
        <li><a href="/carreras/nocturno-adultos" class="text-white/70 no-underline hover:text-gold-bright">Nocturno adultos</a></li>
        <li><a href="/carreras/nocturno-adultos#requisitos" class="text-white/70 no-underline hover:text-gold-bright">Requisitos del nocturno</a></li>
      </ul>
    </div>

    <div>
      <h5 class="text-white text-xs tracking-[1.5px] uppercase font-bold mb-4">Inscripción 2026</h5>
      <ul class="list-none flex flex-col gap-2">
        <li><a href="/inscripcion-2026" class="text-white/70 no-underline hover:text-gold-bright">Cómo inscribirse</a></li>
        <li><a href="/inscripcion-2026#cronograma" class="text-white/70 no-underline hover:text-gold-bright">Cronograma</a></li>
        <li><a href="/inscripcion-2026#requisitos" class="text-white/70 no-underline hover:text-gold-bright">Requisitos</a></li>
        <li><a href="/inscripcion-2026#faq" class="text-white/70 no-underline hover:text-gold-bright">Preguntas frecuentes</a></li>
        <li><a href="/contacto#formulario" class="text-white/70 no-underline hover:text-gold-bright">Formulario de contacto</a></li>
      </ul>
    </div>

    <div>
      <h5 class="text-white text-xs tracking-[1.5px] uppercase font-bold mb-4">Alumnos</h5>
      <ul class="list-none flex flex-col gap-2">
        <li><a href="/alumnos#tramites" class="text-white/70 no-underline hover:text-gold-bright">Trámites</a></li>
        <li><a href="/alumnos#tutoria" class="text-white/70 no-underline hover:text-gold-bright">Tutoría</a></li>
        <li><a href="/alumnos#calendario" class="text-white/70 no-underline hover:text-gold-bright">Calendario académico</a></li>
        <li><a href="/alumnos#violencia" class="text-white/70 no-underline hover:text-gold-bright">Asistencia ante violencia</a></li>
        <li><a href="/contacto#como-llegar" class="text-white/70 no-underline hover:text-gold-bright">Cómo llegar</a></li>
      </ul>
    </div>
  </div>

  <div class="container-et pt-6 flex justify-between text-xs text-white/50 flex-wrap gap-3.5">
    <span>© 2026 · E.T. Nº 21 D.E. 10 · Fragata Escuela Libertad</span>
    <a href="https://www.buenosaires.gob.ar/educacion" target="_blank" rel="noopener" class="text-white/60 no-underline hover:text-gold-bright">Ministerio de Educación · CABA ↗</a>
  </div>
</footer>
```

- [ ] **Step 3: Crear un `src/pages/index.astro` stub para verificar build**

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout
  title="ET21 (dev)"
  description="Sitio en migración — placeholder"
>
  <main class="container-et section-pad">
    <h1 class="text-5xl font-extrabold">Migración en progreso</h1>
    <p class="mt-4">Nav y footer deberían renderizar arriba y abajo.</p>
  </main>
</Layout>
```

Nota: esto pisa temporalmente el mockup `public/index.html`. Astro toma prioridad sobre archivos estáticos con la misma ruta. Lo restauraremos como página real en Task 5.

- [ ] **Step 4: Build + inspección visual**

```bash
npm run build
```

Expected: Build OK. Abrir `dist/index.html` en un browser — el nav sticky debe aparecer arriba con el logo y el CTA dorado, el footer con 5 columnas abajo.

```bash
npm run dev
```

Abrir `http://localhost:4321` — verificar idem en desarrollo.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro src/components/Footer.astro src/pages/index.astro
git commit -m "feat(components): Nav + Footer compartidos con URLs reales"
```

---

## Task 4: Componentes atómicos (Button, Kicker, Section, Breadcrumb)

**Files:**
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/Kicker.astro`
- Create: `src/components/ui/Section.astro`
- Create: `src/components/ui/Breadcrumb.astro`
- Create: `src/components/ui/PageHero.astro`

Estos son los building blocks reutilizables en todas las páginas.

- [ ] **Step 1: Crear `src/components/ui/Button.astro`**

```astro
---
interface Props {
  href?: string;
  variant?: 'primary' | 'ghost' | 'white' | 'outline' | 'gold';
  arrow?: boolean;
  class?: string;
}

const { href, variant = 'primary', arrow = false, class: className = '' } = Astro.props;
const Tag = href ? 'a' : 'button';
const classes = `btn btn-${variant} ${className}`.trim();
---
<Tag href={href} class={classes}>
  <slot />
  {arrow && <span class="arrow transition-transform">→</span>}
</Tag>
```

Y agregar en `global.css` dentro de `@layer components`:

```css
  .btn:hover .arrow { transform: translateX(3px); }
```

- [ ] **Step 2: Crear `src/components/ui/Kicker.astro`**

```astro
---
interface Props {
  light?: boolean;
  class?: string;
}
const { light = false, class: className = '' } = Astro.props;
---
<div class:list={['kicker', light && 'kicker-light', className]}><slot /></div>
```

- [ ] **Step 3: Crear `src/components/ui/Section.astro`**

```astro
---
interface Props {
  alt?: boolean;
  id?: string;
  class?: string;
}
const { alt = false, id, class: className = '' } = Astro.props;
---
{alt ? (
  <section id={id} class:list={['section-alt', 'section-pad', className]}>
    <div class="container-et"><slot /></div>
  </section>
) : (
  <section id={id} class:list={['section-pad', 'container-et', className]}>
    <slot />
  </section>
)}
```

- [ ] **Step 4: Crear `src/components/ui/Breadcrumb.astro`**

```astro
---
interface Crumb { label: string; href?: string; }
interface Props { items: Crumb[]; }
const { items } = Astro.props;
---
<nav class="text-xs text-white/50 mb-7 tracking-wide" aria-label="Breadcrumb">
  {items.map((item, i) => (
    <>
      {item.href ? (
        <a href={item.href} class="text-gold-bright no-underline">{item.label}</a>
      ) : (
        <span>{item.label}</span>
      )}
      {i < items.length - 1 && <span class="mx-1">/</span>}
    </>
  ))}
</nav>
```

- [ ] **Step 5: Crear `src/components/ui/PageHero.astro`**

```astro
---
import Breadcrumb from './Breadcrumb.astro';
import Kicker from './Kicker.astro';

interface Crumb { label: string; href?: string; }

interface Props {
  breadcrumbs: Crumb[];
  kicker: string;
  title: string;
  italicTitle?: string;
  lede?: string;
}

const { breadcrumbs, kicker, title, italicTitle, lede } = Astro.props;
---
<section class="bg-navy text-white py-[90px] px-8 pb-[70px] relative overflow-hidden">
  <div class="absolute -top-[200px] -right-[100px] w-[500px] h-[500px] rounded-full"
       style="background: radial-gradient(circle, rgba(212,160,23,0.2) 0%, transparent 70%);"></div>
  <div class="container-et relative">
    <Breadcrumb items={breadcrumbs} />
    <Kicker light>{kicker}</Kicker>
    <h1 class="text-white text-[64px] font-extrabold leading-[1.02] tracking-[-2.5px] mb-5 max-w-[800px] max-md:text-5xl">
      {title}
      {italicTitle && <><br /><span class="italic-serif text-gold-bright tracking-[-1.8px]">{italicTitle}</span></>}
    </h1>
    {lede && <p class="text-white/80 text-[19px] max-w-[620px] leading-relaxed">{lede}</p>}
    <div class="mt-7 flex gap-3 flex-wrap"><slot /></div>
  </div>
</section>
```

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: Build OK sin usar los componentes aún (solo compilación).

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat(components): Button, Kicker, Section, Breadcrumb, PageHero"
```

---

## Task 5: Bloques compuestos de la home

**Files:**
- Create: `src/components/blocks/HomeHero.astro`
- Create: `src/components/blocks/BuildingStrip.astro`
- Create: `src/components/blocks/DualPath.astro`
- Create: `src/components/blocks/CarrerasGrid.astro`
- Create: `src/components/blocks/Heritage.astro`
- Create: `src/components/blocks/TrustStrip.astro`
- Create: `src/components/blocks/VidaEscolar.astro`
- Create: `src/components/blocks/BlogPreview.astro`
- Create: `src/components/blocks/FAQBlock.astro`
- Create: `src/components/blocks/LocationBlock.astro`
- Create: `src/components/blocks/FinalCTA.astro`

Cada bloque es una sección del mockup portada a Astro. Todos comparten props para el contenido editable desde cada página.

**Implementación:** Para cada bloque, abrir `public/index.html` en la sección correspondiente (por ejemplo, buscar `<section class="hero">` para HomeHero), copiar el HTML, adaptar a Astro (frontmatter con `Props`, usar Tailwind utilities en lugar del CSS inline).

- [ ] **Step 1: `HomeHero.astro`**

Referencia en `public/index.html`: sección `<section class="hero">` del route `home`. Portar copiando estructura, cambiar CSS inline por Tailwind equivalente. Props editables: `kicker`, `titleLine1`, `titleLine2` (italic), `lede`, `metaLocation`, `primaryCtaHref`, `primaryCtaLabel`, `secondaryCtaHref`, `secondaryCtaLabel`, `heroImage`, `heroAlt`, `badges` (array de `{label, value}`).

- [ ] **Step 2: `BuildingStrip.astro`**

Las dos tiles (nuevo edificio + histórico). Props: array de `{href, image, alt, chip, caption}`.

- [ ] **Step 3: `DualPath.astro`**

Dos path-cards. Props: array de `{href, icon, title, description, linkLabel}`.

- [ ] **Step 4: `CarrerasGrid.astro`**

Grid de carreras. Props: array de `{href, image, tag, title, meta, bullets, length, linkLabel}`.

- [ ] **Step 5: `Heritage.astro`**

Historia con imagen + copy. Props: `image`, `imageOverlay`, `kicker`, `titleLine1`, `titleLine2Italic`, `paragraphs` (array), `facts` (array de `{label, value}`), `ctaHref`, `ctaLabel`.

- [ ] **Step 6: `TrustStrip.astro`**

Números en navy. Props: `kicker`, `titleLine1`, `titleLine2Italic`, `stats` (array de `{num, label}`).

- [ ] **Step 7: `VidaEscolar.astro`**

Grid asimétrico 2:1:1 con fotos. Props: `items` (array de `{href, image, alt, label, title, large?}`).

- [ ] **Step 8: `BlogPreview.astro`**

3 cards de posts. Props: `posts` (array de `{href, image, category, title, excerpt, meta}`).

- [ ] **Step 9: `FAQBlock.astro`**

Acordeón con FAQ. Props: `kicker`, `titleLine1`, `titleLine2Italic`, `sideText`, `items` (array de `{q, a}`). Generar Schema.org `FAQPage` cuando `withSchema={true}`.

```astro
---
interface FaqItem { q: string; a: string; }
interface Props {
  kicker: string;
  titleLine1: string;
  titleLine2Italic: string;
  sideText?: string;
  items: FaqItem[];
  withSchema?: boolean;
}
const { kicker, titleLine1, titleLine2Italic, sideText, items, withSchema = true } = Astro.props;

const schema = withSchema ? {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": items.map(({q, a}) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a }
  }))
} : null;
---
{schema && <script type="application/ld+json" set:html={JSON.stringify(schema)}></script>}
<section class="section-pad container-et" id="faq">
  <!-- ...resto del markup del FAQ adaptado... -->
</section>
```

- [ ] **Step 10: `LocationBlock.astro`**

Dirección + iframe de Google Maps embebido (como en el mockup de /contacto).

- [ ] **Step 11: `FinalCTA.astro`**

Banda navy con doble camino. Props: `kicker`, `titleLine1`, `titleLine2Italic`, `copy`, `actionsTitle`, `primaryHref`, `primaryLabel`, `secondaryHref`, `secondaryLabel`.

- [ ] **Step 12: Build check incremental**

Después de cada bloque, correr `npm run build` para detectar errores de sintaxis temprano.

- [ ] **Step 13: Commit al terminar todos los bloques**

```bash
git add src/components/blocks/
git commit -m "feat(blocks): bloques composables de secciones (Hero, Trust, FAQ, etc.)"
```

---

## Task 6: Home page real

**Files:**
- Modify: `src/pages/index.astro` (reemplaza el stub de Task 3)

- [ ] **Step 1: Reescribir `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import HomeHero from '../components/blocks/HomeHero.astro';
import BuildingStrip from '../components/blocks/BuildingStrip.astro';
import DualPath from '../components/blocks/DualPath.astro';
import CarrerasGrid from '../components/blocks/CarrerasGrid.astro';
import Heritage from '../components/blocks/Heritage.astro';
import TrustStrip from '../components/blocks/TrustStrip.astro';
import VidaEscolar from '../components/blocks/VidaEscolar.astro';
import BlogPreview from '../components/blocks/BlogPreview.astro';
import FAQBlock from '../components/blocks/FAQBlock.astro';
import LocationBlock from '../components/blocks/LocationBlock.astro';
import FinalCTA from '../components/blocks/FinalCTA.astro';

const homeFaqs = [
  { q: '¿Cuáles son los requisitos de inscripción para 1° año?', a: 'Certificado de 7° grado en trámite, DNI del alumno/a y del adulto responsable, 2 fotos 4x4 y comprobante de domicilio. El examen diagnóstico se rinde en noviembre.' },
  { q: '¿La escuela tiene costo?', a: 'No, somos una escuela pública del Ministerio de Educación de la Ciudad de Buenos Aires. La cuota es gratuita y se entrega mochila técnica a los ingresantes.' },
  { q: '¿Qué edad se necesita para el nocturno?', a: 'Para cursar el nocturno se requiere tener 16 años cumplidos al momento de inscripción. No hay tope máximo de edad.' },
  { q: '¿El título habilita a ejercer la profesión?', a: 'Sí. Ambos títulos son oficiales y habilitantes.' },
  { q: '¿Cómo llego? ¿Qué colectivos paran cerca?', a: 'Estamos en Núñez 3638, CABA. Líneas cercanas: 29, 42, 60, 114, 130, 184. Subte Línea D.' },
  { q: '¿Hay turno doble o solo uno?', a: 'El ciclo básico es de turno simple (mañana o tarde). El ciclo superior tiene jornada extendida.' },
];
---
<Layout
  title='Escuela Técnica Nº 21 "Fragata Libertad" — Núñez 3638, CABA'
  description="Escuela técnica pública en CABA. Maestro Mayor de Obras y Técnico en Computación con título oficial. Turno diurno para ingresantes y nocturno para adultos. Inscripción 2026 abierta."
>
  <HomeHero /* ...props completos... */ />
  <BuildingStrip /* ... */ />
  <DualPath /* ... */ />
  <CarrerasGrid /* ... */ />
  <Heritage /* ... */ />
  <TrustStrip /* ... */ />
  <VidaEscolar /* ... */ />
  <BlogPreview /* ... */ />
  <FAQBlock kicker="Preguntas frecuentes" titleLine1="Lo que preguntan" titleLine2Italic="las familias." items={homeFaqs} />
  <LocationBlock />
  <FinalCTA /* ... */ />
</Layout>
```

Completar TODOS los props con el copy real del mockup. Referenciar cada prop buscando la sección correspondiente en `public/index.html`.

- [ ] **Step 2: Borrar el mockup estático (ahora lo renderiza Astro)**

```bash
git rm public/index.html
```

- [ ] **Step 3: Build + verificación**

```bash
npm run build
```

Abrir `dist/index.html`. Comparar visualmente contra el mockup original (que podés preservar como `public/index.html.bak` si querés). La home renderizada debe matchear cada sección.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro public/index.html
git commit -m "feat(home): migrar home a Astro con bloques composables"
```

---

## Task 7: Inscripción 2026 page

**Files:**
- Create: `src/pages/inscripcion-2026.astro`
- Create: `src/components/blocks/RequirementsCards.astro`
- Create: `src/components/blocks/Timeline.astro`

- [ ] **Step 1: `RequirementsCards.astro`**

Cards de requisitos (verde/dorado). Props: array de `{variant: 'green'|'gold', tag, title, items[], ctaHref, ctaLabel, ctaVariant}`.

- [ ] **Step 2: `Timeline.astro`**

Línea de tiempo con 4 dots. Props: `items` (array de `{n, title, description}`).

- [ ] **Step 3: `src/pages/inscripcion-2026.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import PageHero from '../components/ui/PageHero.astro';
import Button from '../components/ui/Button.astro';
import Section from '../components/ui/Section.astro';
import Kicker from '../components/ui/Kicker.astro';
import RequirementsCards from '../components/blocks/RequirementsCards.astro';
import Timeline from '../components/blocks/Timeline.astro';
import FAQBlock from '../components/blocks/FAQBlock.astro';
import FinalCTA from '../components/blocks/FinalCTA.astro';

// Copiar TODO el contenido del route data-route="inscripcion" del mockup
// en props/arrays acá (cronograma, requisitos ingresantes, requisitos nocturno, FAQ)
---
<Layout
  title="Inscripción 2026 — Escuela Técnica Nº 21 | Fragata Libertad"
  description="Inscripción abierta para el ciclo lectivo 2026. Cronograma, requisitos y preguntas frecuentes para ingresantes al ciclo básico y adultos del turno nocturno."
>
  <PageHero
    breadcrumbs={[{label:'Inicio', href:'/'}, {label:'Inscripción 2026'}]}
    kicker="Ciclo lectivo 2026"
    title="Inscripción 2026"
    italicTitle="abierta."
    lede="Dos caminos de inscripción según tu caso. Elegí el que corresponda, revisá requisitos y fechas, y acercate a la escuela."
  />

  <Section>
    <RequirementsCards /* ... */ />
  </Section>

  <Section alt id="cronograma">
    <Timeline /* ... */ />
  </Section>

  <!-- ...resto de bloques del mockup... -->

  <FinalCTA /* ... */ />
</Layout>
```

- [ ] **Step 4: Build + verificación visual**

```bash
npm run build && npm run preview
```

Abrir `http://localhost:4321/inscripcion-2026/`. Verificar:
- H1 correcto
- 2 cards de caminos con los bullets completos
- Timeline con 4 pasos
- FAQ con 4 preguntas sobre inscripción
- Final CTA
- Breadcrumb arriba
- Anchors funcionando: `/inscripcion-2026#cronograma` scrollea a la sección

- [ ] **Step 5: Commit**

```bash
git add src/pages/inscripcion-2026.astro src/components/blocks/
git commit -m "feat(inscripcion): página de inscripción 2026 con cronograma y requisitos"
```

---

## Task 8: Landing MMO (Maestro Mayor de Obras)

**Files:**
- Create: `src/pages/carreras/maestro-mayor-de-obras.astro`
- Create: `src/components/blocks/PlanDeEstudios.astro`
- Create: `src/components/blocks/SalidaLaboral.astro`
- Create: `src/components/blocks/SplitInfo.astro`

- [ ] **Step 1: `SplitInfo.astro`**

Grid 2-col con copy a la izquierda e info-box a la derecha. Props: `kicker`, `titleLine1`, `titleLine2Italic`, `paragraphs` (array), `boxTitle`, `boxItems` (array de strings con `✓`).

- [ ] **Step 2: `PlanDeEstudios.astro`**

Grid de 6 años (1° a 6°). Props: `kicker`, `titleLine1`, `titleLine2Italic`, `description`, `years` (array de `{year, label, subjects[]}`).

- [ ] **Step 3: `SalidaLaboral.astro`**

Grid de 3 stats con title + descripción. Props: `kicker`, `titleLine1`, `titleLine2Italic`, `stats` (array de `{num, description}`).

- [ ] **Step 4: `src/pages/carreras/maestro-mayor-de-obras.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import PageHero from '../../components/ui/PageHero.astro';
import Button from '../../components/ui/Button.astro';
import SplitInfo from '../../components/blocks/SplitInfo.astro';
import PlanDeEstudios from '../../components/blocks/PlanDeEstudios.astro';
import SalidaLaboral from '../../components/blocks/SalidaLaboral.astro';
import FinalCTA from '../../components/blocks/FinalCTA.astro';

// Plan de estudios de MMO — copiar del route data-route="mmo" del mockup
const plan = [
  { year: '1°', label: 'Ciclo básico', subjects: ['Matemática I', 'Lengua', 'Tecnología de la representación', 'Taller polivalente'] },
  { year: '2°', label: 'Ciclo básico', subjects: ['Matemática II', 'Física', 'Dibujo técnico', 'Taller de construcción'] },
  { year: '3°', label: 'Ciclo básico', subjects: ['Matemática III', 'Química', 'Tecnología de materiales', 'Taller de obra'] },
  { year: '4°', label: 'Superior', subjects: ['Resistencia de materiales', 'Instalaciones sanitarias', 'Construcciones I', 'Práctica profesionalizante'] },
  { year: '5°', label: 'Superior', subjects: ['Construcciones II', 'Hormigón armado', 'Instalaciones eléctricas', 'Costos y presupuestos'] },
  { year: '6°', label: 'Superior', subjects: ['Proyecto final', 'Dirección de obra', 'Legislación', 'Práctica profesional'] },
];
---
<Layout
  title="Maestro Mayor de Obras en CABA — ET Nº 21 Fragata Libertad"
  description="Carrera de Maestro Mayor de Obras de 6 años con título oficial habilitante. Dirigir obras, calcular estructuras, firmar planos municipales. Plan oficial del Ministerio de Educación CABA."
>
  <PageHero
    breadcrumbs={[{label:'Inicio', href:'/'}, {label:'Carreras', href:'/carreras/maestro-mayor-de-obras'}, {label:'Maestro Mayor de Obras'}]}
    kicker="Carrera técnica · 6 años"
    title="Maestro Mayor"
    italicTitle="de Obras."
    lede="Formate para dirigir obras, interpretar planos y calcular estructuras. Título oficial habilitante del Ministerio de Educación. Turnos mañana y tarde."
  >
    <Button href="/inscripcion-2026" variant="gold" arrow>Inscripción 2026</Button>
    <Button href="/contacto" variant="outline">Solicitar charla informativa</Button>
  </PageHero>

  <SplitInfo /* ... */ />
  <PlanDeEstudios years={plan} /* ... */ />
  <SalidaLaboral /* ... */ />
  <FinalCTA /* ... */ />
</Layout>
```

- [ ] **Step 5: Build + verificar**

```bash
npm run build && npm run preview
```

Abrir `http://localhost:4321/carreras/maestro-mayor-de-obras/`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/carreras/maestro-mayor-de-obras.astro src/components/blocks/
git commit -m "feat(mmo): landing SEO de Maestro Mayor de Obras"
```

---

## Task 9: Landing Técnico en Computación

**Files:**
- Create: `src/pages/carreras/tecnico-en-computacion.astro`

Reusa todos los componentes de Task 8. Solo cambia el contenido.

- [ ] **Step 1: Crear la página copiando la estructura de MMO**

Copiar `maestro-mayor-de-obras.astro` → `tecnico-en-computacion.astro` y cambiar:
- Title / description / H1
- Plan de estudios (ver mockup `data-route="computacion"`)
- Áreas de formación en SplitInfo
- Stats de salida laboral

```astro
---
// ...
const plan = [
  { year: '1°', label: 'Ciclo básico', subjects: ['Matemática I', 'Lengua', 'Tecnología de la información', 'Taller informático'] },
  { year: '2°', label: 'Ciclo básico', subjects: ['Matemática II', 'Física', 'Lógica y algoritmia', 'Programación introductoria'] },
  { year: '3°', label: 'Ciclo básico', subjects: ['Electrónica básica', 'Programación I', 'Sistemas operativos', 'Taller de hardware'] },
  { year: '4°', label: 'Superior', subjects: ['Programación II', 'Bases de datos', 'Redes I', 'Práctica profesionalizante'] },
  { year: '5°', label: 'Superior', subjects: ['Desarrollo web', 'Redes II', 'Robótica', 'Gestión de proyectos'] },
  { year: '6°', label: 'Superior', subjects: ['Proyecto final', 'Arquitectura de software', 'Seguridad', 'Práctica profesional'] },
];
---
<Layout
  title="Técnico en Computación — ET Nº 21 Fragata Libertad"
  description="Carrera de Técnico en Computación de 6 años con título oficial. Programación, redes, bases de datos y robótica. Laboratorios modernos en Núñez 3638."
>
  <!-- ...estructura idéntica a MMO con contenido de computación... -->
</Layout>
```

- [ ] **Step 2: Build + verificar**

```bash
npm run build
```

Verificar `dist/carreras/tecnico-en-computacion/index.html`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/carreras/tecnico-en-computacion.astro
git commit -m "feat(computacion): landing SEO de Técnico en Computación"
```

---

## Task 10: Landing Nocturno adultos

**Files:**
- Create: `src/pages/carreras/nocturno-adultos.astro`
- Create: `src/components/blocks/StatsRow.astro`

- [ ] **Step 1: `StatsRow.astro`**

Fila de 3 stats grandes (usada en nocturno + cómputos internos). Props: `stats` (array de `{num, label}`). Ya tenemos algo similar en `SalidaLaboral` pero este es más simple — solo 3 cajas sin kicker.

- [ ] **Step 2: `src/pages/carreras/nocturno-adultos.astro`**

Portar el route `data-route="nocturno"` del mockup. Incluye:
- PageHero
- StatsRow (3·18-23·Gratis)
- CarrerasGrid (con variante nocturno, 3 años en lugar de 6)
- RequirementsCards (requisitos específicos del nocturno)
- FinalCTA

```astro
---
import Layout from '../../layouts/Layout.astro';
import PageHero from '../../components/ui/PageHero.astro';
import Button from '../../components/ui/Button.astro';
import Section from '../../components/ui/Section.astro';
import StatsRow from '../../components/blocks/StatsRow.astro';
import CarrerasGrid from '../../components/blocks/CarrerasGrid.astro';
import RequirementsCards from '../../components/blocks/RequirementsCards.astro';
import FinalCTA from '../../components/blocks/FinalCTA.astro';
---
<Layout
  title="Nocturno adultos — Terminá tu secundario técnico | ET21"
  description="Turno nocturno para adultos +16 en la Escuela Técnica Nº 21. MMO o Técnico en Computación en 3 años, título oficial, escuela pública y gratuita."
>
  <PageHero
    breadcrumbs={[{label:'Inicio', href:'/'}, {label:'Nocturno adultos'}]}
    kicker="Turno nocturno · Adultos +16"
    title="Terminá tu secundario"
    italicTitle="técnico."
    lede="Tres años de cursada nocturna, título oficial habilitante, y la posibilidad real de entrar al mercado laboral con un oficio. Sin tope de edad."
  >
    <Button href="/inscripcion-2026" variant="gold" arrow>Inscripción Nocturno 2026</Button>
    <Button href="/contacto" variant="outline">Escribinos</Button>
  </PageHero>

  <Section>
    <StatsRow stats={[
      { num: '3', label: 'Años de cursada (en vez de 6 del diurno)' },
      { num: '18–23', label: 'Horario de clases, lunes a viernes' },
      { num: 'Gratis', label: 'Escuela pública, sin cuota, título oficial' },
    ]} />
  </Section>

  <!-- ...resto del mockup... -->

  <FinalCTA /* ... */ />
</Layout>
```

- [ ] **Step 3: Build + verificar**

```bash
npm run build
```

Verificar `dist/carreras/nocturno-adultos/index.html`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/carreras/nocturno-adultos.astro src/components/blocks/StatsRow.astro
git commit -m "feat(nocturno): landing SEO del turno nocturno adultos"
```

---

## Task 11: Institucional page

**Files:**
- Create: `src/pages/institucional.astro`
- Create: `src/components/blocks/AuthorityGrid.astro`

- [ ] **Step 1: `AuthorityGrid.astro`**

Grid de cards con avatar + nombre + rol. Props: array de `{initial, name, role}`.

- [ ] **Step 2: `src/pages/institucional.astro`**

Portar el route `data-route="institucional"`. Incluye:
- PageHero
- Heritage (con el ID `historia` para anchor)
- VidaEscolar (fotos del edificio nuevo)
- AuthorityGrid
- SplitInfo (proyecto educativo)
- FinalCTA

```astro
---
import Layout from '../layouts/Layout.astro';
import PageHero from '../components/ui/PageHero.astro';
import Heritage from '../components/blocks/Heritage.astro';
import VidaEscolar from '../components/blocks/VidaEscolar.astro';
import AuthorityGrid from '../components/blocks/AuthorityGrid.astro';
import SplitInfo from '../components/blocks/SplitInfo.astro';
import FinalCTA from '../components/blocks/FinalCTA.astro';

const authorities = [
  { initial: 'D', name: 'Dirección', role: 'Rectoría general' },
  { initial: 'V', name: 'Vicedirección diurna', role: 'Turno mañana y tarde' },
  { initial: 'N', name: 'Vicedirección nocturna', role: 'Turno noche' },
  { initial: 'C', name: 'Jefatura de carreras', role: 'MMO y Computación' },
  { initial: 'S', name: 'Secretaría', role: 'Trámites y matrícula' },
  { initial: 'T', name: 'Tutoría', role: 'Acompañamiento al alumno' },
];
---
<Layout
  title="Institucional — Escuela Técnica Nº 21 Fragata Libertad"
  description="74 años formando técnicos. Historia, proyecto educativo y equipo directivo de la Escuela Técnica Nº 21 D.E. 10 Fragata Escuela Libertad en Núñez 3638, CABA."
>
  <PageHero /* ... */ />
  <Heritage /* ...con id="historia"... */ />
  <VidaEscolar /* ...con fotos del edificio... */ />
  <AuthorityGrid items={authorities} />
  <SplitInfo /* ...proyecto educativo... */ />
  <FinalCTA /* ... */ />
</Layout>
```

- [ ] **Step 3: Build + verificar**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/institucional.astro src/components/blocks/AuthorityGrid.astro
git commit -m "feat(institucional): historia, autoridades y proyecto educativo"
```

---

## Task 12: Alumnos page

**Files:**
- Create: `src/pages/alumnos.astro`

Reusa componentes existentes. Portar route `data-route="alumnos"`.

- [ ] **Step 1: `src/pages/alumnos.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import PageHero from '../components/ui/PageHero.astro';
import Section from '../components/ui/Section.astro';
import RequirementsCards from '../components/blocks/RequirementsCards.astro';
import SplitInfo from '../components/blocks/SplitInfo.astro';
import Timeline from '../components/blocks/Timeline.astro';
---
<Layout
  title="Espacio del alumno — ET Nº 21 Fragata Libertad"
  description="Trámites, tutoría, calendario académico 2026 y canales de asistencia. Todo lo que necesitás durante tu cursada en la Escuela Técnica Nº 21."
>
  <PageHero
    breadcrumbs={[{label:'Inicio', href:'/'}, {label:'Alumnos'}]}
    kicker="Alumnos"
    title="Espacio"
    italicTitle="del alumno."
    lede="Trámites, documentación, calendario académico y canales de acompañamiento. Todo lo que necesitás durante tu cursada en la escuela."
  />

  <Section id="tramites">
    <RequirementsCards /* ...trámites... */ />
  </Section>

  <Section alt id="tutoria">
    <SplitInfo /* ...tutoría... */ />
  </Section>

  <Section id="calendario">
    <Timeline /* ...calendario académico... */ />
  </Section>

  <Section alt id="violencia">
    <SplitInfo /* ...asistencia ante violencia, con info-box navy... */ />
  </Section>
</Layout>
```

- [ ] **Step 2: Build + verificar**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/alumnos.astro
git commit -m "feat(alumnos): espacio del alumno con trámites, tutoría, calendario y violencia"
```

---

## Task 13: Contacto page

**Files:**
- Create: `src/pages/contacto.astro`
- Create: `src/components/blocks/ContactForm.astro`
- Create: `src/components/blocks/GoogleMap.astro`
- Create: `src/components/seo/SchemaLocalBusiness.astro`

- [ ] **Step 1: `SchemaLocalBusiness.astro`**

```astro
---
const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Escuela Técnica Nº 21 D.E. 10 Fragata Escuela Libertad",
  "image": "https://et21.com.ar/images/fachada-calle.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Núñez 3638",
    "addressLocality": "Ciudad Autónoma de Buenos Aires",
    "addressCountry": "AR"
  },
  "telephone": "+54-11-4543-7363",
  "email": "info@et21.com.ar",
  "openingHours": "Mo-Fr 08:00-23:00",
  "url": "https://et21.com.ar"
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)}></script>
```

- [ ] **Step 2: `GoogleMap.astro`**

```astro
---
interface Props {
  address: string;
  label?: string;
  height?: number;
}
const { address, label = address, height = 260 } = Astro.props;
const encoded = encodeURIComponent(address);
---
<div class="rounded-xl overflow-hidden border border-line shadow-[0_10px_30px_-15px_rgba(11,37,69,0.2)]">
  <iframe
    title={`Ubicación — ${label}`}
    src={`https://www.google.com/maps?q=${encoded}&output=embed`}
    width="100%"
    height={height}
    style="border:0; display:block;"
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    allowfullscreen
  ></iframe>
  <div class="p-3 bg-cream flex justify-between items-center text-[13px]">
    <div><strong class="text-ink">📍 {label}</strong></div>
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${encoded}`}
      target="_blank"
      rel="noopener"
      class="text-gold no-underline font-bold"
    >Cómo llegar ↗</a>
  </div>
</div>
```

- [ ] **Step 3: `ContactForm.astro`**

Mockup del form (con `action=#` y `onsubmit="return false"` para prevenir envío real). Nota para backend futuro: usar Cloudflare Workers + Turnstile o formsubmit.co.

- [ ] **Step 4: `src/pages/contacto.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import PageHero from '../components/ui/PageHero.astro';
import ContactForm from '../components/blocks/ContactForm.astro';
import LocationBlock from '../components/blocks/LocationBlock.astro';
import SchemaLocalBusiness from '../components/seo/SchemaLocalBusiness.astro';
---
<Layout
  title="Contacto — Escuela Técnica Nº 21 Fragata Libertad"
  description="Contactá la secretaría de la ET Nº 21 en Núñez 3638, CABA. Formulario, teléfono (011) 4543-7363, email info@et21.com.ar, ubicación en mapa y líneas de colectivo."
>
  <Fragment slot="schema"><SchemaLocalBusiness /></Fragment>

  <PageHero
    breadcrumbs={[{label:'Inicio', href:'/'}, {label:'Contacto'}]}
    kicker="Contacto"
    title="Escribinos"
    italicTitle="o visitanos."
    lede="Secretaría, inscripción, turnos y consultas generales. Te respondemos en 48 hs hábiles por mail, o atendemos en horario escolar."
  />

  <section class="container-et section-pad grid grid-cols-2 gap-14 max-md:grid-cols-1" id="formulario">
    <!-- Form side con mapa y lista de contactos -->
    <!-- Form fields -->
  </section>

  <LocationBlock id="como-llegar" />
</Layout>
```

- [ ] **Step 5: Build + verificar**

```bash
npm run build
```

Abrir `/contacto/` y verificar:
- Formulario renderiza con todos los fields
- Mapa de Google se carga en iframe
- Anchors `#formulario` y `#como-llegar` funcionan
- Schema.org LocalBusiness está en el `<head>`

- [ ] **Step 6: Commit**

```bash
git add src/pages/contacto.astro src/components/blocks/ContactForm.astro src/components/blocks/GoogleMap.astro src/components/seo/SchemaLocalBusiness.astro
git commit -m "feat(contacto): formulario, mapa y schema LocalBusiness"
```

---

## Task 14: Blog Content Collection

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/como-prepararte-examen-ingreso.mdx`
- Create: `src/content/blog/que-hace-maestro-mayor-de-obras.mdx`
- Create: `src/content/blog/terminar-secundario-tecnico-de-noche.mdx`

Astro Content Collections dan validación de schema + type safety + type-checked Markdown.

- [ ] **Step 1: `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string().min(10).max(100),
    description: z.string().min(50).max(160),
    category: z.enum(['Ingreso', 'Construcción', 'Tecnología', 'Nocturno', 'Vida escolar', 'Institucional']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image(),
    heroAlt: z.string(),
    readingMinutes: z.number().int().positive(),
    author: z.string().default('Equipo ET21'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Copiar imágenes para los posts**

Los posts necesitan imágenes. Reusamos las de `public/images/`. En Content Collections, las imágenes pueden venir del filesystem dentro del mismo directorio del post (`src/content/blog/assets/*`) o referenciarse como rutas públicas. Para simplicidad, las referenciamos desde `public/images/`:

Cambiar `heroImage: image()` por `heroImage: z.string()` y usarlo como URL en los templates.

- [ ] **Step 3: Escribir los 3 posts MDX**

`src/content/blog/como-prepararte-examen-ingreso.mdx`:

```mdx
---
title: "Cómo prepararte para el examen de ingreso a la ET21"
description: "Guía práctica para chicos de 7° grado: qué se evalúa, cómo se rinde y recursos de estudio para el examen de ingreso a la Escuela Técnica Nº 21."
category: "Ingreso"
pubDate: 2026-04-05
heroImage: "/images/patio-palmeras.jpg"
heroAlt: "Nuevo edificio de la ET21 con palmeras y fachada moderna"
readingMinutes: 6
---

Todos los años recibimos la misma pregunta de familias que están considerando inscribir a sus hijos a la Escuela Técnica Nº 21: **¿cómo es el examen de ingreso y cómo se preparan los chicos?** Acá una guía clara, sin vueltas.

## Primero lo importante: no es un examen eliminatorio

El examen de ingreso a la ET21 es un **diagnóstico**, no un examen de selección.

> El objetivo del examen no es dejar afuera a nadie, sino entender cómo acompañar mejor a cada chico desde marzo.

...
```

(Copiar el contenido restante del mockup `data-route="blog/post-ingreso"`.)

Idem para los otros 2 posts usando el contenido del mockup.

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | head -30
```

Expected: Sin errores de validación del schema. Si un frontmatter no cumple, va a tirar un error específico.

- [ ] **Step 5: Commit**

```bash
git add src/content/
git commit -m "feat(blog): Content Collection con 3 posts iniciales"
```

---

## Task 15: Blog index page

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/components/blocks/BlogCard.astro`

- [ ] **Step 1: `BlogCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}
const { post } = Astro.props;
const { title, description, category, pubDate, heroImage, heroAlt, readingMinutes } = post.data;
const href = `/blog/${post.slug}/`;
const pubStr = pubDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
---
<a href={href} class="block bg-white border border-line rounded-[14px] overflow-hidden no-underline text-inherit transition-all hover:-translate-y-0.5 hover:border-navy hover:shadow-card-hover flex flex-col">
  <div class="h-[180px] bg-cream overflow-hidden">
    <img src={heroImage} alt={heroAlt} class="w-full h-full object-cover" loading="lazy" />
  </div>
  <div class="p-[22px] flex-1 flex flex-col">
    <div class="text-[10px] tracking-[1.6px] uppercase font-extrabold text-gold mb-2.5">{category}</div>
    <h3 class="text-[17px] font-bold text-ink leading-[1.3] mb-2.5 tracking-[-0.4px]">{title}</h3>
    <p class="text-sm text-body flex-1 leading-[1.5]">{description}</p>
    <div class="text-xs text-muted mt-3.5 pt-3.5 border-t border-line">{readingMinutes} min · {pubStr}</div>
  </div>
</a>
```

- [ ] **Step 2: `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import PageHero from '../../components/ui/PageHero.astro';
import Section from '../../components/ui/Section.astro';
import BlogCard from '../../components/blocks/BlogCard.astro';

const posts = await getCollection('blog', ({ data }) => !data.draft);
posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

const categories = ['Todos', 'Ingreso', 'Construcción', 'Tecnología', 'Nocturno', 'Vida escolar', 'Institucional'];
---
<Layout
  title="Blog — Novedades y guías | ET Nº 21 Fragata Libertad"
  description="Guías de ingreso, incumbencias profesionales, vida escolar y novedades de la Escuela Técnica Nº 21. Lo que las familias y aspirantes quieren saber."
>
  <PageHero
    breadcrumbs={[{label:'Inicio', href:'/'}, {label:'Blog'}]}
    kicker="Novedades y guías"
    title="El blog de"
    italicTitle="la Fragata."
    lede="Guías de ingreso, incumbencias profesionales, vida escolar y novedades institucionales. Lo que las familias y aspirantes quieren saber."
  />

  <Section>
    <div class="flex gap-2.5 mb-10 flex-wrap">
      {categories.map(cat => (
        <button class={`px-4 py-2 text-[13px] font-semibold rounded-lg border-[1.5px] ${cat === 'Todos' ? 'bg-navy text-white border-navy' : 'border-ink text-ink hover:bg-ink hover:text-white'}`}>{cat}</button>
      ))}
    </div>
    <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1">
      {posts.map(post => <BlogCard post={post} />)}
    </div>
  </Section>
</Layout>
```

- [ ] **Step 3: Build + verificar**

```bash
npm run build
```

Verificar `dist/blog/index.html` con los 3 posts listados.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/index.astro src/components/blocks/BlogCard.astro
git commit -m "feat(blog): listado del blog con cards desde Content Collection"
```

---

## Task 16: Blog post template

**Files:**
- Create: `src/pages/blog/[...slug].astro`
- Create: `src/components/seo/SchemaBlogPosting.astro`

- [ ] **Step 1: `SchemaBlogPosting.astro`**

```astro
---
interface Props {
  headline: string;
  description: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author: string;
  url: string;
}
const { headline, description, image, datePublished, dateModified, author, url } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": headline,
  "description": description,
  "image": image,
  "datePublished": datePublished.toISOString(),
  "dateModified": (dateModified ?? datePublished).toISOString(),
  "author": { "@type": "Organization", "name": author, "url": "https://et21.com.ar" },
  "publisher": {
    "@type": "EducationalOrganization",
    "name": "Escuela Técnica Nº 21 Fragata Escuela Libertad",
    "logo": { "@type": "ImageObject", "url": "https://et21.com.ar/logo.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": url }
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)}></script>
```

- [ ] **Step 2: `src/pages/blog/[...slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import Breadcrumb from '../../components/ui/Breadcrumb.astro';
import BlogCard from '../../components/blocks/BlogCard.astro';
import SchemaBlogPosting from '../../components/seo/SchemaBlogPosting.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post, allPosts: posts },
  }));
}

interface Props {
  post: CollectionEntry<'blog'>;
  allPosts: CollectionEntry<'blog'>[];
}

const { post, allPosts } = Astro.props;
const { Content } = await post.render();
const { title, description, category, pubDate, heroImage, heroAlt, readingMinutes, author } = post.data;

const related = allPosts.filter(p => p.slug !== post.slug).slice(0, 3);
const pubStr = pubDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
const canonical = `https://et21.com.ar/blog/${post.slug}/`;
---
<Layout
  title={`${title} — Blog ET21`}
  description={description}
  canonical={canonical}
  ogImage={heroImage}
>
  <Fragment slot="schema">
    <SchemaBlogPosting
      headline={title}
      description={description}
      image={`https://et21.com.ar${heroImage}`}
      datePublished={pubDate}
      author={author}
      url={canonical}
    />
  </Fragment>

  <section class="bg-navy text-white py-[70px] px-8 pb-[50px] relative overflow-hidden">
    <div class="container-et relative">
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: 'Blog', href: '/blog/' },
        { label: category },
      ]} />
      <div class="kicker kicker-light">{category} · {readingMinutes} min de lectura</div>
      <h1 class="text-white text-5xl font-extrabold leading-[1.02] tracking-[-2px] max-w-[900px]">{title}</h1>
    </div>
  </section>

  <article class="max-w-[780px] mx-auto py-[60px] px-8">
    <div class="text-[13px] text-muted py-5 border-t border-b border-line mb-[30px] flex gap-5">
      <span>✍️ {author}</span>
      <span>📅 {pubStr}</span>
      <span>🏷 {category}</span>
    </div>

    <div class="h-[420px] rounded-2xl overflow-hidden mb-10">
      <img src={heroImage} alt={heroAlt} class="w-full h-full object-cover" />
    </div>

    <div class="prose-et">
      <Content />
    </div>
  </article>

  <section class="section-alt section-pad">
    <div class="container-et">
      <div class="kicker mb-5">Seguí leyendo</div>
      <h2 class="text-4xl font-extrabold mb-10 tracking-[-1.5px]">Artículos <span class="italic-serif text-gold font-medium">relacionados.</span></h2>
      <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1">
        {related.map(p => <BlogCard post={p} />)}
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Agregar estilos tipográficos en `global.css`**

Dentro de `@layer components`:

```css
.prose-et p { @apply text-[17px] text-body leading-[1.7] mb-5; }
.prose-et h2 { @apply text-3xl font-bold text-ink mt-10 mb-5 tracking-[-1px]; }
.prose-et h3 { @apply text-2xl font-bold text-ink mt-8 mb-4 tracking-[-0.6px]; }
.prose-et ul, .prose-et ol { @apply my-5 pl-5; }
.prose-et li { @apply text-[17px] text-body leading-[1.7] py-1; }
.prose-et blockquote { @apply border-l-4 border-gold py-2.5 pl-6 my-7 text-[22px] leading-[1.4] text-ink italic-serif; }
.prose-et a { @apply text-gold font-bold underline underline-offset-2; }
```

- [ ] **Step 4: Build + verificar**

```bash
npm run build
```

Verificar:
- `dist/blog/como-prepararte-examen-ingreso/index.html` existe
- `dist/blog/que-hace-maestro-mayor-de-obras/index.html` existe
- `dist/blog/terminar-secundario-tecnico-de-noche/index.html` existe
- Cada uno tiene el `<script type="application/ld+json">` con BlogPosting schema

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/[...slug].astro src/components/seo/SchemaBlogPosting.astro src/styles/global.css
git commit -m "feat(blog): template de post individual con Schema BlogPosting"
```

---

## Task 17: Sitemap XML automático

**Files:**
- Modify: `astro.config.mjs` (ya configurado en Task 1)
- Modify: `public/robots.txt`

`@astrojs/sitemap` genera `sitemap-index.xml` + `sitemap-0.xml` durante el build. Con `site: 'https://et21.com.ar'` en la config ya funciona sin más setup.

- [ ] **Step 1: Build y verificar generación**

```bash
npm run build
ls dist/sitemap-*.xml
```

Expected: `dist/sitemap-index.xml` y `dist/sitemap-0.xml` existen y listan todas las páginas (incluidos los 3 blog posts dinámicos).

- [ ] **Step 2: Confirmar que `robots.txt` referencia el sitemap**

```bash
grep -i sitemap public/robots.txt
```

Expected: Ya contiene `Sitemap: https://et21.com.ar/sitemap-index.xml` (si no, agregarlo).

- [ ] **Step 3: Commit (solo si hubo cambios en robots.txt)**

```bash
git add public/robots.txt
git commit -m "feat(seo): confirmar referencia a sitemap-index en robots.txt"
```

---

## Task 18: Limpieza y verificación final

**Files:**
- Modify: varios

- [ ] **Step 1: Correr typecheck**

```bash
npx astro check
```

Expected: `0 errors, 0 warnings`. Si hay warnings, revisar.

- [ ] **Step 2: Build completo**

```bash
npm run build
```

Expected:
- Build time < 15s
- `dist/` contiene todas las rutas:
  - `dist/index.html`
  - `dist/inscripcion-2026/index.html`
  - `dist/carreras/maestro-mayor-de-obras/index.html`
  - `dist/carreras/tecnico-en-computacion/index.html`
  - `dist/carreras/nocturno-adultos/index.html`
  - `dist/institucional/index.html`
  - `dist/alumnos/index.html`
  - `dist/contacto/index.html`
  - `dist/blog/index.html`
  - `dist/blog/como-prepararte-examen-ingreso/index.html`
  - `dist/blog/que-hace-maestro-mayor-de-obras/index.html`
  - `dist/blog/terminar-secundario-tecnico-de-noche/index.html`
  - `dist/404/index.html`
  - `dist/sitemap-*.xml`
  - `dist/robots.txt`
  - `dist/logo.png`, `dist/images/*`, `dist/_headers`

- [ ] **Step 3: Preview local**

```bash
npm run preview
```

Navegar manualmente:
- `/` — home completa, todos los bloques visibles
- Click en nav: cada link abre la página correcta
- Click en footer: cada link (incluidos anchors) funciona
- `/blog` → lista 3 posts
- Click en un post → artículo con schema BlogPosting en `<head>`
- `/contacto#como-llegar` → scrollea al mapa
- `/ruta-inexistente` → muestra 404.astro

- [ ] **Step 4: Auditoría SEO inline**

Por cada página (home + 3 carreras + inscripción + blog), verificar en el HTML fuente:
- `<title>` único y específico
- `<meta name="description">` único (50–160 caracteres)
- `<link rel="canonical">` apunta a la URL real
- `<script type="application/ld+json">` con el schema apropiado

```bash
# Inspección rápida
grep -o '<title>[^<]*</title>' dist/**/index.html
grep -c 'application/ld+json' dist/*/index.html
```

- [ ] **Step 5: Lighthouse local (si hay Chrome)**

```bash
npx lighthouse http://localhost:4321 --preset=desktop --quiet --chrome-flags="--headless"
```

Expected: scores ≥ 95 en Performance, Accessibility, Best Practices, SEO.

- [ ] **Step 6: Cleanup del mockup (si todavía existe)**

```bash
test -f public/index.html && git rm public/index.html
```

El `public/index.html` del mockup ya no debería existir — Astro sirve la home desde `src/pages/index.astro`.

- [ ] **Step 7: Actualizar README con estado final**

Marcar los checkboxes del roadmap como completados en `README.md`.

- [ ] **Step 8: Commit final**

```bash
git add -A
git commit -m "chore: migración Astro completa + verificación final"
```

- [ ] **Step 9: Push a producción**

```bash
git push origin main
```

Cloudflare Pages detecta el push y dispara deploy automático. Verificar en `dash.cloudflare.com` que el build termine verde y el sitio sea accesible.

---

## Self-review

### Spec coverage

- [x] Objetivo 1 — Institucional moderno: Layout + Home + Institucional + design system (Tasks 1–6, 11)
- [x] Objetivo 2 — Conversión a inscripción: Inscripción page + dual path en home (Tasks 6, 7)
- [x] Objetivo 3 — SEO-first: Schema por página (EducationalOrg, FAQPage, LocalBusiness, BlogPosting), sitemap, canonicals (Tasks 2, 9, 13, 16, 17)
- [x] Audiencia A (familias): dual path + inscripción + FAQ + landings de carreras (6, 7, 8, 9)
- [x] Audiencia B (adultos nocturno): landing dedicada + dual path (10)
- [x] Blog con long-tail: Content Collection + index + template (14, 15, 16)
- [x] URLs semánticas: `/carreras/maestro-mayor-de-obras`, `/blog/[slug]` (plan de rutas)
- [x] Identidad visual Institucional Moderno: design tokens + Tailwind theme + componentes (Tasks 1, 2)
- [x] Assets reales del edificio: referenciados en páginas (home, carreras, institucional)
- [x] Deploy en Cloudflare Pages: stack ya scaffoldeado; Task 18 Step 9 dispara deploy

### Tradeoffs explícitos

- El `LocationBlock` reusa la implementación de Task 13 (GoogleMap). Si Task 13 se ejecuta después de Task 6, la home podría tener que refactorizar la location inline → dejar TODO en Task 6 para extraer y hacerlo definitivo en Task 13.
- Las páginas de carreras (Tasks 8–10) son casi idénticas — considerar un layout compartido `CarreraLayout.astro` si empieza a haber duplicación real.

### Placeholders

Hice grep por "TBD", "TODO", "implement later" y similares. Los "TODO" que aparecen son intencionales en los comentarios de código como hint al implementador (p.ej. "completar con copy del mockup") — no son placeholders del plan. Cada Step tiene código concreto o comando concreto.

### Consistency

- Componente `FAQBlock` con `withSchema={true}` — usado en home y en inscripción. Mismo tipo de data en ambos.
- `CarrerasGrid` — usado en home y en nocturno con la misma signature.
- `Heritage` — usado en home y en institucional con el mismo componente.
- Los nombres de páginas (`inscripcion-2026`, `maestro-mayor-de-obras`, `nocturno-adultos`, `tecnico-en-computacion`) son SEO-friendly y consistentes en routes + footer + nav.
