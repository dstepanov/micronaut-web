# Vendored Brand Icons

This folder contains a curated subset of SVGs from Simple Icons 16.19.0, plus
the two exceptions recorded below.

`graalvm.svg` is the official GraalVM icon, downloaded from the GraalVM brand
guidelines at https://www.graalvm.org/graalvm-brand-guidelines/, which publish
it for "events, social media, online mentions, and other possible use cases".
Two deliberate departures from those guidelines are recorded here: the mark is
rendered in the Micronaut blue (#2f73b9) rather than the official GraalVM blue
so the card icons read as one set, and the file's `viewBox` was cropped to the
artwork's bounding box. The cropping removes only empty canvas — the official
file carries a ~29% margin, which left the hairline rabbit far too small inside
a 36px badge — and does not change the drawing itself.

`oracle.svg` is not present in Simple Icons 16.19.0 (nor in any later release);
its origin predates this folder and could not be established.

Amazon and Microsoft have both had their marks withdrawn from Simple Icons at
their own request, so AWS, Azure, SQL Server, and Cosmos DB are named in text
rather than badged. The database marks are named in text as well, so no
per-database icon is vendored here.

The Simple Icons package is released under CC0, but individual brand icons can
carry separate license and trademark considerations. See:

- `simple-icons-LICENSE.md`
- `simple-icons-DISCLAIMER.md`

The generated docs render these SVGs as sidebar, module-card, and
code-language icons for nominative identification of supported technologies.
Some project icons use the Simple Icons brand color in the UI when it improves
recognition.
