# Micronaut Main Redesign Plan

## Target Experience

Redesign `/main` as the primary Micronaut Framework marketing surface while keeping it aligned with the existing Astro/shadcn docs and guides surfaces. The page should feel like the current `micronaut.io` homepage reworked into a denser developer entry point: fast explanation, clear CTAs, scannable technical proof, code examples, customer proof, and routes into docs, guides, Launch, GraalVM, and Micronaut Data.

## Source Material Used

- Live `https://micronaut.io/` homepage hero: "A modern, JVM-based, full-stack framework for building modular, easily testable microservice and serverless applications."
- Homepage CTAs adapted for consistent capitalization: "View the documentation", "Browse guides", "Launch a project".
- Homepage sections: "Reimagine startup time and memory consumption", "Key Features", "Who's using The Micronaut Framework?", "Micronaut success stories", Netty HTTP server, compile-time HTTP client, testing, "Natively Cloud Native", GraalVM startup, and Micronaut Data.
- Feature labels and descriptions from the homepage where available: Polyglot Framework, Natively Cloud-Native, Fast Data-Access Config, Smooth Learning Curve, Fast, Easy Unit Testing, Aspect-Oriented API, Seamless API Visibility, and AOT Compilation.
- Existing local Micronaut assets from `public/micronaut-assets`, especially logo variants, Sally icon, language icons, and brand/simple-icons.

## Component Mapping

- Layout and top navigation: existing `WebLayout` and `SiteHeader`.
- Brand: existing `MicronautLogo` and local `/micronaut-assets/logos/*`.
- CTAs and content surfaces: real shadcn components from `src/components/ui`: `Button`, `Badge`, `Card`, `Separator`.
- Code samples: new `MainCodeShowcase` React island using real shadcn `Tabs` from `@/components/ui/tabs`.
- Icons: existing `IconGlyph` wrapper, using lucide icons and local brand SVGs.

## Page Sections

1. Hero: source homepage positioning and three source CTAs.
2. Startup and memory comparison: "The Micronaut way" against "The old way".
3. Key Features: eight-card grid with polished public-facing feature names and concise source-aligned descriptions.
4. Code examples: tabbed Netty HTTP server, compile-time HTTP client, and testing examples with copy controls.
5. Who uses Micronaut: local logo wall, success-story previews, and success-stories CTA.
6. Cloud/GraalVM/Data: three balanced proof cards for cloud integrations, no-reflection GraalVM support, and Micronaut Data.
7. Final routing band: docs, guides, and Launch.

## Assets

- Prefer existing `public/micronaut-assets` assets for brand, icons, and ecosystem logos.
- Downloaded missing homepage customer logos into `public/micronaut-assets/home/`:
  - `minecraft.png`
  - `mojang.png`
  - `samsung-smart-things.png`
  - `target.png`
  - `agorapulse-logo-white-bg.png`
  - `sonar-black-and-grey.svg`
- Do not hotlink homepage images from `micronaut.io`.

## Verification

- Run `npm run protocol` implicitly through `npm run build`.
- Run `npm run build`.
- Inspect `/main/` in the in-app browser if the dev server is available or started.
- Check desktop and mobile layouts for text overflow, incoherent overlap, and dark-mode logo/contrast issues.
- Check code-tab copy buttons, search command dialog, and mobile sheet navigation by keyboard.

## Follow-Up

- Add a footer once the docs/guides/main IA is stable.
- Consider downloading the remaining official cloud logos if exact parity with the current homepage logo cloud becomes a hard requirement.
- Consider content collections for success stories if these previews become editable content.
