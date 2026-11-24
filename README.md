# The World Today — 23 November 2026

[![News date](https://img.shields.io/badge/news-23%20Nov%202026-blue)](https://make.fun)
[![Stories](https://img.shields.io/badge/stories-31-green)](https://make.fun)
[![Runtime](https://img.shields.io/badge/node-22-brightgreen)](https://nodejs.org)

A single dense newspaper page that sums up Monday 23 November 2026 in one
image: 31 verified stories from 7 regions — climate, the Middle East, Europe,
Asia-Pacific, Africa, the Americas, and technology — set in two columns under
one masthead.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png`, a 1024x1024 PNG under 1 MiB. The renderer is
fully deterministic: it uses only the Node standard library and a small
bitmap font atlas baked into `main.ts`, so it needs no network, no clock,
and no randomness, and two runs produce byte-identical output.

## License

MIT — see `LICENSE`.
