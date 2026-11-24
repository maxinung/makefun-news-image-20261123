# The World Today — 23 November 2026

[![make.fun · news-image-20261123](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/maxinung/makefun-news-image-20261123/rank.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/maxinung/makefun-news-image-20261123/reward.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)

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
