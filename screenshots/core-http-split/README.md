# Core and HTTP docs split

Screenshots of the docs surface rendering Micronaut Core's guide as two
projects, taken from `micronaut-core` v5.1.13 with
`node scripts/render-docs.ts --slugs core,http --sync-sources`.

| Screenshot | Shows |
| --- | --- |
| `docs-index.png` | The docs catalog, with HTTP beside Core in the first section |
| `docs-http.png` | The HTTP project page and its own section navigation |
| `docs-http-sections.png` | HTTP sections numbered as a standalone guide |
| `docs-core.png` | Core without the HTTP server and client sections |
| `docs-core-cross-link.png` | A Core cross-reference that now opens the HTTP page (highlighted) |

They document the prototype rather than the site build, and can be dropped
once the split is settled.
