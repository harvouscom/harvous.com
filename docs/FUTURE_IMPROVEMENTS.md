# Future improvements

Things noticed along the way that are worth doing, but not yet.

## Compare popularity

The hub's icon strips are ordered by App Store rating count, which doesn't refresh on its own. Rerun `npm run compare:popularity` now and then, and add an App Store id to `scripts/fetch-compare-popularity.mjs` for each new compare entry that has an app.

## Manna compare page

- The copy comes only from Manna's own homepage. Re-read it against the product before publishing. Study Tools & Notes overlaps with Harvous, so check that the "Best at" framing is fair.
- `data/compare.csv` row uses placeholder `Collection ID` / `Item ID` values (`local-bible-reader`, `local-manna-001`), like the other local entries.
- The Manna icon is a flattened copy of their transparent logo on a cream background (`#FFF3E6`). Replace it with an official app-store icon if they have one.
- Manna also has a discipleship school (the O.P.E.N. and W.I.L.L. courses) and church and group curriculum (`/lead-a-church`, `/lead-a-group`). A second angle, such as a Group Study comparison, could be worth a look.

## Compare icon pipeline

- Icons with transparent backgrounds render badly on the orange hero. Have `scripts/generate-compare-og-images.mjs` flatten transparent icons onto a neutral background when it downloads them, so this doesn't need a manual step each time.
- `npm run og:compare -- --force` rewrites every card (the 59 existing ones came out identical this time). A `--only <slug>` flag would be safer.
