---
name: Rediseño sitio ET21
description: Spec de diseño del rediseño del sitio institucional de la Escuela Técnica Nº 21 "Fragata Libertad"
date: 2026-04-22
status: approved
---

# Rediseño sitio et21.com.ar — Escuela Técnica Nº 21

## Contexto

La Escuela Técnica Nº 21 D.E. 10 "Fragata Escuela Libertad" es una escuela técnica pública del Ministerio de Educación de CABA, fundada en octubre de 1952. Actualmente en Núñez 3638 (edificio nuevo desde 2019). Ofrece dos carreras de 6 años: **Maestro Mayor de Obras** y **Técnico en Computación**, con tres turnos (mañana, tarde y nocturno para adultos).

El sitio actual (WordPress estándar) tiene problemas evidentes: sin hero, sin identidad visual, CTA de inscripción débil, diseño plano, y cero estrategia SEO.

## Objetivo

Rediseñar el sitio con tres prioridades:

1. **Institucional moderno** — proyectar una escuela seria con identidad propia y prolija.
2. **Conversión a inscripción** — que el flujo de inscripción 2026 (ingresantes + adultos nocturno) sea obvio y friccionless.
3. **SEO-first** — rankear para búsquedas locales, de carrera y de long-tail via blog.

## Audiencias

Dos audiencias primarias, con viajes paralelos en la home:

- **A) Familias de ingresantes** — padres/madres decidiendo la escuela secundaria de sus hijos de 12–13 años. Buscan: salida laboral, seriedad, requisitos, cercanía.
- **B) Adultos para el turno nocturno** — +16 años que quieren terminar el secundario técnico. Buscan: requisitos, horarios, gratuidad, tiempo real de cursada.

## Stack

- **Astro 4 + Tailwind 3** — SSR estático, SEO técnico out-of-the-box, Core Web Vitals verdes por default.
- **Cloudflare Pages** — hosting edge, deploy automático desde Git.
- **Sin CMS inicial** — contenido en MDX dentro del repo; headless CMS a evaluar más adelante si la frecuencia de publicación lo justifica.

## Identidad visual

**Dirección aprobada: Institucional Moderno.** Respeta el isologo actual de la escuela (emblema circular azul + dorado) y refresca todo lo demás.

### Paleta
- `--navy` `#0B2545` — primario, fondos institucionales
- `--navy-2` `#13315C` — hover/degradé
- `--navy-dk` `#06192D` — footer
- `--gold` `#B8872B` — acentos sobrios
- `--gold-bright` `#D4A017` — CTAs y destacados
- `--cream` `#F8F7F2` — fondos alternativos, cards neutras
- `--off-white` `#FAF9F4` — fondo base
- `--ink` `#0B2545` — tipografía principal
- `--body` `#3E4B63` — cuerpo secundario
- `--line` `#E6E3D8` — bordes sutiles

### Tipografía
- **Inter** (400/500/700/800) — cuerpo y títulos principales
- **Fraunces italic** (500) — acentos en H1/H2 (p.ej. "oficio y criterio")
- Proporciones: H1 56–64px, H2 40px, body 15–18px

### Voz
Seria sin ser antigua. Directa sin ser fría. "Técnico, no bootcamp. Pública, no improvisada."

## Arquitectura del sitio

Aprobado: sitio completo + blog.

```
/                                   Home
├── /institucional                  Historia, autoridades, proyecto educativo
├── /carreras
│   ├── /maestro-mayor-de-obras    Landing SEO ("MMO CABA")
│   ├── /tecnico-en-computacion    Landing SEO ("Técnico Computación")
│   └── /nocturno-adultos          Landing SEO ("secundario técnico nocturno")
├── /inscripcion-2026              Conversión: cronograma + requisitos + FAQ
├── /alumnos                       Trámites, tutoría, calendario, violencia
├── /blog                          Listado + categorías
│   └── /blog/[slug]              Posts individuales
└── /contacto                      Formulario + mapa + direcciones
```

## Estrategia SEO (aprobado A+B+C+D)

- **A)** Intención local + marca: "escuela técnica 21", "fragata libertad escuela", "et21"
- **B)** Carreras específicas: "maestro mayor de obras caba", "técnico en computación escuela"
- **C)** Nocturno/adultos: "terminar secundario técnico nocturno caba"
- **D)** Long-tail vía blog: "qué hace un MMO", "cómo es el examen de ingreso a una escuela técnica"

### Marcado estructural requerido

- `EducationalOrganization` en todas las páginas (con dirección, teléfono, logo)
- `FAQPage` en home + inscripción + nocturno (para rich snippets en SERP)
- `BlogPosting` en cada artículo
- `BreadcrumbList` en páginas internas
- `LocalBusiness` en contacto (Map Pack)

### Performance targets (Lighthouse)

- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO = 100
- LCP < 2.0s (hero con `fetchpriority="high"`)
- CLS < 0.05
- Imágenes optimizadas (Astro `<Image>` + `srcset`)

## Composición de la home (aprobada)

1. **Barra superior** — banner inscripción 2026
2. **Nav sticky** — logo + 6 links + CTA dorado
3. **Hero** — H1 con keyword, lede SEO, doble CTA, foto real del patio (palmeras + fachada)
4. **Building strip** — 2 tiles: edificio nuevo (Núñez 3638) + fachada histórica (1952)
5. **Dual path** — card "familia ingresante" + card "adulto nocturno"
6. **Carreras** — 2 cards grandes con foto, bullets y link a landing SEO
7. **Nuestra historia** — fachada histórica + texto + facts institucionales
8. **Trust section (navy)** — 4 números en Fraunces italic dorado (1952 · +3200 · 6 años · 3 turnos)
9. **Vida escolar** — grid asimétrico 2:1:1 con fotos reales
10. **Blog preview** — 3 posts destacados
11. **FAQ** — acordeón de 6 preguntas con Schema `FAQPage`
12. **Ubicación** — info + mapa embed (Google Maps iframe)
13. **Final CTA** — banda navy con dual path repetido
14. **Footer** — 5 columnas: Brand · Institución · Carreras · Inscripción · Alumnos

## Assets disponibles

Fotos reales recuperadas del sitio actual (via WP REST API):

- `logo.png` — logo institucional circular
- `patio-palmeras.jpg` — hero principal (patio interior del nuevo edificio)
- `fachada-calle.jpg` — fachada desde la vereda
- `fachada-historica.jpg` — edificio original de 1952
- `patio-naranja.jpg` — patio con pared naranja y bancos
- `edificio-esquina.jpg` — vista de esquina
- `edificio-lateral.jpg` — vista lateral del edificio

## Decisiones y trade-offs

**Por qué Astro y no WordPress/Next.js:**
- SEO técnico crítico → Astro sirve HTML puro; mejor que SPA de Next/React.
- La escuela no tiene dev ni CI complejo → build simple, deploy con `git push`.
- WP tiene overhead operativo (plugins, updates, seguridad) que la escuela no tiene quién mantener.

**Por qué dos audiencias visibles desde la home:**
- Padres y adultos tienen intención muy diferente. Un mensaje genérico falla con los dos.
- Dual-path card es patrón probado (ej: universidades con undergrad/grad).

**Por qué landings individuales por carrera:**
- "Maestro Mayor de Obras CABA" es la keyword de mayor intención comercial.
- Compartir una sola página `/carreras` diluye el ranking; una URL por carrera maximiza relevancia.

**Por qué blog con long-tail:**
- Términos directos (nombre de escuela + carrera) son de volumen bajo.
- Long-tail educativo genera tráfico orgánico estable a 12 meses.

## Out of scope (por ahora)

- Portal de alumnos con login — se mantiene link externo al sistema del Ministerio.
- Sistema de inscripción online nativo — la inscripción sigue por el portal de CABA.
- Multilingüe — sitio en español argentino únicamente.
- Blog con CMS headless — inicialmente MDX en repo; reevaluar si el equipo docente publica con frecuencia.

## Estado actual del proyecto

- Mockup de alta fidelidad del sitio entero construido y aprobado (ver `public/index.html`).
- Proyecto Astro scaffoldeado con Tailwind configurado.
- Imágenes reales del edificio copiadas a `public/images/`.
- SEO head y Schema.org implementados en el HTML de home.
- Pendiente: migrar el mockup HTML a páginas Astro componentizadas (ver roadmap en README).
