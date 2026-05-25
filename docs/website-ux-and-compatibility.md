# Website UX And Compatibility

This document is the maintainer-facing contract for Micronaut web UI/UX work, legacy URL handling, and production host mapping.

## PageSpeed Baselines

Observed baselines before this pass:

| Surface | URL | Form factor | Performance | Accessibility | Best Practices | SEO | Notes |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| Homepage | `https://dstepanov.github.io/micronaut-web/` | Desktop | 100 | 93 | 100 | 100 | Main issues were shared link naming and low-contrast brand opacity patterns. |
| Homepage | `https://dstepanov.github.io/micronaut-web/` | Mobile | 96 | 93 | 100 | 100 | Cache lifetime is partly hosting-controlled. |
| Docs index | `https://dstepanov.github.io/micronaut-web/docs/` | Mobile | 93 | 95 | 100 | 100 | Main issues were unnamed generated anchors, image dimensions, and unused hydrated JS. |
| Core docs | `https://dstepanov.github.io/micronaut-web/docs/core/` | Desktop | Needs re-run after generated docs render | Needs re-run after generated docs render | Needs re-run after generated docs render | Needs re-run after generated docs render | Core is the heaviest generated page and the main DOM-size/performance risk. |

Known Core docs findings:

- The generated Core page can exceed 100k DOM nodes when the full guide is rendered.
- Generated heading anchor links must have accessible names.
- Generated docs images should have stable dimensions or get dimensions attached once loaded.
- Render-blocking and unused JavaScript should be reduced by keeping static page chrome server-rendered where possible and hydrating only interactive controllers.

## UI/UX Findings And Intended Fixes

- Header and footer logo links need explicit accessible names because the visual logo image is decorative.
- Generated heading anchors need `aria-label` values derived from heading text.
- Repeated generic links such as guide card "Read" actions need item-specific labels.
- Brand-colored text should not rely on reduced opacity where that can lower contrast.
- Logos, project icons, customer logos, language icons, and generated docs images need stable sizing to reduce layout shift.
- Docs/Core should favor readable generated content, a predictable sidebar, and active section state without making the generated article part of a large hydrated island.
- Guides index must remain available at `/latest/index.html` and support URL-backed filtering with `q`, `category`, `tag`, and `sort`.
- Launch share URLs should remain stable while exposing validation, selected-feature summary, and keyboard-friendly flow.

## Production Hosts

The preview build keeps GitHub Pages support through `ASTRO_BASE=/micronaut-web/`.

Production mapping:

| Surface | Production origin | Preview path |
| --- | --- | --- |
| Main site | `https://micronaut.io/` | `/micronaut-web/` |
| Docs | `https://docs.micronaut.io/` | `/micronaut-web/docs/` |
| Guides | `https://guides.micronaut.io/latest/index.html` | `/micronaut-web/latest/` and `/micronaut-web/guides/` |
| Assets | Main production origin or deployment CDN | `/micronaut-web/micronaut-assets/` |

Use `src/lib/route-compatibility.ts` for production host constants and host-aware URL helpers. Do not add production host strings directly to route modules when a helper can express the destination.

## Compatibility Manifest Schema

The route compatibility manifest lives in `src/lib/route-compatibility.ts`.

Each entry has:

| Field | Purpose |
| --- | --- |
| `id` | Stable identifier used by tests and route modules. |
| `sourceSurface` | Surface receiving the legacy URL: `main`, `docs`, `guides`, or `assets`. |
| `sourcePath` | Representative legacy path, with `{placeholder}` markers for route families. |
| `destinationSurface` | Surface that owns the canonical destination. |
| `previewDestinationPath` | All-in-one preview target, before `ASTRO_BASE` is applied. |
| `productionDestinationPath` | Production target path on `destinationSurface`. |
| `status` | Expected status for redirect-style routes, or `200` for production aliases. |
| `behavior` | `canonical`, `redirect`, `external-redirect`, or `alias`. |
| `preservesSearch` | Whether query strings are expected to survive the redirect. |
| `preservesHash` | `client`, `same-document`, or `not-available`. URL fragments are not sent to servers, so server redirects cannot preserve them. |
| `notes` | Maintainer context and constraints. |

When a legacy route is added, update the manifest and add or update one route module. Avoid duplicating redirect tables across pages.

## Compatibility Matrix

| Representative old URL | Preview behavior | Production behavior | Notes |
| --- | --- | --- | --- |
| `https://micronaut.io/core/` | Deferred until `/core/` routing is resumed | Deferred until main-host Core routing is resumed | Tracked here as a known legacy URL, but not implemented in this pass. |
| `/core/?q=bean` | Deferred until `/core/` routing is resumed | Deferred until main-host Core routing is resumed | Query/hash preservation should be covered when this route is reintroduced. |
| `https://docs.micronaut.io/latest/guide/` | `/micronaut-web/latest/guide/` redirects to `/micronaut-web/docs/core/` | Remains Core docs on docs host | Production may serve this as canonical or alias. |
| `https://docs.micronaut.io/latest/guide/index.html#ioc` | `/micronaut-web/latest/guide/index.html` redirects to `/micronaut-web/docs/core/#ioc` in client-capable redirects | Redirect or alias to Core docs with the same section | Fragments require client redirect pages. |
| `https://guides.micronaut.io/latest/index.html` | `/micronaut-web/latest/index.html` redirects to `/micronaut-web/latest/` | Redirect or alias to guides latest index | Query strings are preserved. |
| `https://guides.micronaut.io/latest/tag-security.html` | Redirects to the generated tag route when present, otherwise external production tag URL | Served or redirected by guides production | Existing tag compatibility stays generated from guide metadata. |
| `https://guides.micronaut.io/latest/micronaut-http-client.html` | Redirects to slash-style generated overview when present, otherwise external production URL | Served by guides production | Applies to guide overview `.html` pages. |
| `https://guides.micronaut.io/latest/micronaut-http-client-gradle-java.html` | Redirects to slash-style generated variant when present, otherwise external production URL | Served by guides production | Applies to language/build variants. |
| `https://guides.micronaut.io/latest/micronaut-http-client-gradle-java.zip` | Redirects to production ZIP URL | Production ZIP remains downloadable | ZIP redirects are temporary external redirects. |
| `https://micronaut.io/blog/2020-04-30-introducing-micronaut-launch.html` | Redirects to the canonical dated post | Redirects to the canonical dated post | Dated blog aliases are generated from post metadata. |
| `https://micronaut.io/blog/2019-07-18-unleashing-predator-precomputed-data-repositories.html` | Redirects to `/2019/07/18/announcing-micronaut-data/` | Same canonical post | Explicit historical aliases remain in `blog-redirects`. |
| Any supported route with `#section` | Same-document anchors stay intact; client redirect pages preserve hashes across route changes | Same rule | Server redirects cannot see fragments. |

## Canonical URL Rules

- Main-site canonical content uses `https://micronaut.io/`.
- Docs canonical catalog pages use `https://docs.micronaut.io/`; Core legacy docs paths continue to resolve.
- Guides canonical generated guide URLs use `https://guides.micronaut.io/latest/`.
- GitHub Pages preview URLs must always be generated with `ASTRO_BASE`, not hard-coded as production links.
- Legacy URLs should prefer permanent redirects unless the destination points to another production host for generated artifacts, where temporary redirects are safer.
- Main-host `/core/` compatibility is intentionally deferred for now; add it through `src/lib/route-compatibility.ts` when route work resumes.

## Accessibility And Performance Acceptance Criteria

- Docs accessibility target: 100 after generated docs are present.
- No known shared unnamed logo link or generated heading-anchor link remains.
- Repeated generic links must have accessible names that identify the target item.
- CLS remains `0` for docs mobile.
- Docs mobile performance improves from the baseline without introducing new render-blocking script work.
- Images in static components have explicit intrinsic dimensions or a stable sizing wrapper.
- Generated docs images receive lazy loading, async decoding, and dimensions when the browser can determine them.

## Manual QA Checklist

- Build with `ASTRO_BASE=/micronaut-web/` and verify all preview links keep the base path.
- Check `/`, `/docs/`, `/docs/core/`, `/latest/`, `/latest/index.html`, `/latest/guide/`, `/latest/guide/index.html`, `/guides/`, a guide detail page, `/launch/`, `/blog/`, a dated blog alias, and a content page.
- Repeat the checks on desktop and mobile widths.
- Verify `/latest/guide/index.html#ioc` preserves the fragment after redirect.
- Verify guides filters update and restore state with `q`, `category`, `tag`, and `sort`.
- Verify Launch share URLs keep selected settings/features and validation text is announced through field descriptions.
- Re-run PageSpeed or Lighthouse-style checks for homepage, docs index, and Core docs after deployment assets are available.

## Automated Checks

Run:

```bash
npm run typecheck
npm run typecheck:scripts
npm run test:main-site
npm run test:guides
npm run test:docs
npm run build
```

This repository currently names the docs test script `test:docs`; use that for the planned `test:platform-docs` coverage unless a separate script is introduced.
