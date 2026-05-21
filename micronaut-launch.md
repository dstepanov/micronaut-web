# Micronaut Launch Redesign Notes

Date: 2026-05-21

## Scope

This work adds a new `/launch/` page to the Astro prototype and a Java Gradle Playwright test project that verifies project generation against the real Micronaut Launch backend.

The implementation is intentionally scoped to Launch:

- New Astro route: `src/pages/launch/index.astro`
- New React UI: `src/components/web/launch-app.tsx`
- Real shadcn/ui components added under `src/components/ui`
- Minimal shared header/layout typing so `/launch/` appears in the site nav
- Java Playwright test project under `launch-playwright-tests`

## Source Research Notes

The public Launch page at `https://micronaut.io/launch/` is a JavaScript app. The raw HTML contains a single root node and loads:

- `/launch/static/js/main.5e0da3d0.js`
- `/launch/static/css/main.fa46a5a9.css`
- `/launch/asset-manifest.json`

The static HTML has the fallback text `You need to enable JavaScript to run this app`.

The bundled app and direct backend inspection show these core workflows:

- Configure application type, JDK, name, base package, Micronaut version, language, build tool, test framework, and features.
- Load select options from `https://launch.micronaut.io/select-options`.
- Load application types from `https://launch.micronaut.io/application-types`.
- Load features from `https://launch.micronaut.io/application-types/{type}/features`.
- Generate ZIP downloads from `https://launch.micronaut.io/create/{type}/{name}`.
- Open preview JSON from `https://launch.micronaut.io/preview/{type}/{name}`.
- Open text diffs from `https://launch.micronaut.io/diff/{type}/{name}`.

Observed application types:

- `default` / `DEFAULT`: Micronaut Application
- `cli` / `CLI`: Command Line Application
- `function` / `FUNCTION`: Function Application for Serverless
- `grpc` / `GRPC`: gRPC Application
- `messaging` / `MESSAGING`: Messaging-Driven Application

Observed select option groups:

- `jdkVersion`
- `lang`
- `test`
- `build`
- `type`

As of this run, `select-options` returned Java, Groovy, Kotlin, JUnit, Spock, Kotest, Gradle, Gradle Kotlin, Maven, and JDK 25.

## Backend Contract Observations

Create URL shape:

```text
https://launch.micronaut.io/create/default/com.example.demo?lang=JAVA&build=GRADLE&test=JUNIT&javaVersion=JDK_25&features=serialization-jackson,management
```

Observed create response:

- Status: `201`
- Header: `content-disposition: attachment; filename=demo.zip`
- Content type may report `text/html`, but the body is a valid ZIP.

Preview URL shape:

```text
https://launch.micronaut.io/preview/default/com.example.demo?lang=JAVA&build=GRADLE&test=JUNIT&javaVersion=JDK_25&features=serialization-jackson,management
```

Observed preview response:

- JSON object with `_links` and `contents`.
- `contents` maps generated project paths to file contents.
- Binary entries, such as `gradle/wrapper/gradle-wrapper.jar`, are represented as `null`.

Diff URL shape:

```text
https://launch.micronaut.io/diff/default/com.example.demo?lang=JAVA&build=GRADLE&test=JUNIT&javaVersion=JDK_25&features=serialization-jackson,management
```

Observed diff response:

- Plain text unified diff.
- Selecting `management` adds `io.micronaut:micronaut-management` to `build.gradle`, updates `micronaut-cli.yml`, and adds README feature documentation.

Important static-site limitation:

- `https://launch.micronaut.io` did not return `Access-Control-Allow-Origin` for this Astro origin during inspection.
- The static page therefore links directly to create, preview, and diff backend URLs instead of trying to read preview/diff responses with browser `fetch`.
- ZIP download still works through normal browser navigation because it does not require reading the cross-origin response body in JavaScript.

## UX Proposal Implemented

The new `/launch/` page uses a dense operational layout consistent with the current `/main`, `/docs`, and `/guides` surfaces:

- Hero band with current generated coordinate and live catalog status.
- Project settings card for name, package, application type, Java version, language, build tool, and test framework.
- Quick buttons for the Java + Gradle + JUnit path used by the integration test.
- Feature selector card with search and checkbox cards.
- Sticky summary column with selected features, generate actions, command snippets, backend limitation notice, and create URL payload.
- Phase 2 Decision Center for configuration, reactive model, API errors, and HTTP client choices.
- Conflict warnings in the selected stack summary when expert feature selection creates multiple choices in one decision group.

The page favors immediate project generation over a marketing-style landing page. The first screen contains usable controls and a primary `Download ZIP` action.

## Phase 2 Decision Center Slice

The first Phase 2 slice addresses the discovery and one-choice problems described in `micronaut-projects/micronaut-starter#2191`.

Added Launch-side decision metadata:

- Configuration: `properties`, `yaml`, `toml`
- Reactive model: no feature, `reactor`, `rxjava3`
- API errors: no feature, `problem-json`
- HTTP client: no feature, `http-client`, `http-client-jdk`, `reactor-http-client`, `rxjava3-http-client`

Implementation details:

- Metadata and pure helpers live in `src/lib/launch-decisions.ts`.
- `resolveDecisionGroups()` filters choice metadata against the live feature catalog for the selected application type.
- `applyDecisionChoice()` removes sibling features from the same decision group before adding the selected feature.
- The Decision Center is rendered above the raw expert feature picker.
- Each choice has a detail sheet with summary, when-to-use guidance, when-not-to-use guidance, tradeoffs, and the canonical CLI feature flag.
- The raw feature picker remains available and can still create conflicts; conflicts are visible in both the Decision Center and selected stack summary.

This keeps the Starter API payload canonical: selected feature IDs are still the only generation input.

## Phase 3 UX/UI PR 1 Slice

The first Phase 3 slice applies the layout-shell and overlay-fix recommendations from the UX/UI improvement plan.

Changes made:

- Replaced the tall hero with a compact builder intro: `Build a Micronaut project`.
- Moved backend/date/feature-count/conflict status into a slim status strip.
- Reduced page max width to `1440px`.
- Changed the desktop builder grid to `minmax(720px, 1fr)` plus a `390px` sticky summary rail.
- Moved the current project/runtime/catalog status out of the hero and into a new sticky `ProjectSummaryCard`.
- Made `Download ZIP` the single dominant primary action in the summary rail.
- Kept preview/diff visible but secondary through the compact intro and secondary actions card.
- Removed the duplicate right-rail ZIP action so generation does not compete with itself.

The API contract and canonical feature payload remain unchanged.

## shadcn/ui Component Mapping

Existing real shadcn components used:

- `Button`
- `Card`
- `Badge`
- `Dialog`
- `Input`
- `Separator`

Added real shadcn components through the configured shadcn registry:

- `select`
- `label`
- `checkbox`
- `alert`
- `textarea`

The Launch UI imports these from `@/components/ui/...`.

## Build-Time Data Strategy

`src/pages/launch/index.astro` fetches the live Launch backend at build/render time:

- `/select-options`
- `/application-types`
- `/application-types/{type}/features` for every returned type

If the API is unavailable at build time, the page falls back to a small embedded catalog with the core application types and representative features. The UI labels this as `Fallback catalog`; otherwise it labels the page as `Live catalog`.

## Test Project Structure

Gradle files:

- `settings.gradle.kts`
- `gradle/wrapper/gradle-wrapper.jar`
- `gradle/wrapper/gradle-wrapper.properties`
- `gradlew`
- `gradlew.bat`
- `launch-playwright-tests/build.gradle.kts`

Java test:

- `launch-playwright-tests/src/test/java/io/micronaut/web/launch/LaunchPagePlaywrightTest.java`

The test uses:

- JUnit Jupiter via JUnit BOM `6.0.3`
- Playwright Java `1.60.0`
- Java toolchain 21

Environment/configuration:

- `LAUNCH_BASE_URL`: local Astro page, default `http://127.0.0.1:4321/launch/`
- `LAUNCH_API_BASE_URL`: real backend, default `https://launch.micronaut.io`
- `LAUNCH_BROWSER_CHANNEL`: browser channel, default `chrome`
- `LAUNCH_BROWSER_EXECUTABLE`: optional browser executable override
- `PLAYWRIGHT_BROWSERS_PATH`: set by Gradle to `launch-playwright-tests/build/ms-playwright`

The writable `PLAYWRIGHT_BROWSERS_PATH` is required in this sandbox because Playwright Java cannot write to the default user cache.

## Test Coverage

The Java Playwright test:

1. Opens `/launch/`.
2. Selects Java, Gradle, and JUnit through visible UI controls.
3. Searches for and selects the `management` starter feature.
4. Selects `problem-json` from the API errors decision group.
5. Selects `http-client`, then `http-client-jdk`, from the HTTP client decision group to verify one-choice replacement.
6. Asserts the visible create URL points to `https://launch.micronaut.io/create/default/com.example.demo`.
7. Asserts the create URL contains `problem-json` and `http-client-jdk` but not the replaced `http-client` choice.
8. Clicks `Download ZIP`.
9. Captures the browser download from the real backend.
10. Opens the ZIP and verifies:
   - `build.gradle` exists.
   - `src/main/java/com/example/Application.java` exists.
   - `micronaut-cli.yml` exists.
   - `build.gradle` contains `io.micronaut:micronaut-management`.
   - `micronaut-cli.yml` contains `sourceLanguage: java`, `buildTool: gradle`, `management`, `problem-json`, and `http-client-jdk`.

This covers the core backend-integrated flow without faking the Starter API.

## Verification Results

Commands run:

```bash
npm run build
```

Result:

- Passed.
- Latest run passed with protocol validation at 68 projects, 68 fixture projects, and 185 guides.
- Astro built 282 pages in the current workspace state.
- Vite emitted an existing-style chunk-size warning, but the build completed successfully.

```bash
env JAVA_HOME=/Users/denisstepanov/.sdkman/candidates/java/21-oracle LAUNCH_BASE_URL=http://127.0.0.1:4324/launch/ ./gradlew :launch-playwright-tests:test
```

Result:

- Passed.
- First run downloaded Playwright-managed browsers into `launch-playwright-tests/build/ms-playwright`.
- Gradle emitted a non-fatal FSEvents warning: `Could not start the FSEvents stream`.
- The test downloaded and inspected a real generated ZIP from `https://launch.micronaut.io`.

Phase 2 targeted test command:

```bash
env JAVA_HOME=/Users/denisstepanov/.sdkman/candidates/java/21-oracle LAUNCH_BASE_URL=http://127.0.0.1:4324/launch/ ./gradlew :launch-playwright-tests:test --tests 'io.micronaut.web.launch.LaunchPagePlaywrightTest'
```

Result:

- Passed.
- Verified the Decision Center can replace one HTTP-client choice with another before generation.
- Verified the generated ZIP from the real backend includes the selected decision features.

Phase 3 targeted test command:

```bash
env JAVA_HOME=/Users/denisstepanov/.sdkman/candidates/java/21-oracle LAUNCH_BASE_URL=http://127.0.0.1:4324/launch/ ./gradlew :launch-playwright-tests:test --tests 'io.micronaut.web.launch.LaunchPagePlaywrightTest'
```

Result:

- Passed.
- Verified the compact `Build a Micronaut project` intro heading.
- Verified the moved summary-rail `Download ZIP` action still downloads a real ZIP from `https://launch.micronaut.io`.
- Verified the Decision Center replacement path and generated ZIP contents still work after the layout change.

Browser-tool note:

- The MCP Playwright and Chrome DevTools browser surfaces were unavailable because existing browser profiles were already locked.
- The Java Playwright test provided browser-level verification for this pass.

Initial blockers resolved:

- Running Gradle with Java 25 failed before tests; rerunning with Java 21 fixed Gradle execution.
- Playwright Java initially attempted to write to `~/Library/Caches/ms-playwright`, which is not writable in this sandbox. Setting `PLAYWRIGHT_BROWSERS_PATH` to the test build directory fixed it.

## Follow-Up Recommendations

- If this app moves from static output to SSR, add a same-origin server proxy for Launch preview/diff so the UI can render generated file trees inline without CORS issues.
- Add deep-link hydration for query parameters (`type`, `name`, `package`, `features`) if share links become a required workflow.
- Add CI/unit coverage for `resolveDecisionGroups()` and `applyDecisionChoice()` if a TypeScript test runner is introduced.
- Promote the Launch-side decision metadata into an API-owned metadata endpoint once the Starter API can expose one-choice groups directly.
- Consider code splitting the Launch app if the Vite chunk-size warning becomes a production concern.
