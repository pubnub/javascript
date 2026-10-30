---
name: sdk-release
description: Use when finalizing a PubNub JavaScript SDK PR for merge or release. Covers rebuilding the committed lib/ and dist/web artifacts, verifying release consistency, and writing the PR description the changelog bot reads.
---

# sdk-release

1. **Never edit versions or changelogs.** A GitHub bot writes the version strings, `CHANGELOG.md` and `.pubnub.yml`
   from the PR description. Its version targets are listed in `.github/workflows/release/versions.json`.
   `.agents/hooks/protect-files.sh` blocks edits to the changelog files. Feature work never bumps the version.
2. Run `npm run build`. It regenerates `lib/` and `dist/web/`, and every source PR commits both.
   Review the source diff first, then sanity-check `git diff --stat lib dist` for unexpected files.
3. Run `.scripts/agent-test.sh release`. It checks that `package.json`, `getVersion()` and the README CDN links agree,
   and type-checks the aggregated declarations.
4. Write the PR title and body in the format from `.github/pull_request_template.md`: `type(scope): subject`, a body,
   then a footer. The bot builds the changelog from them, so state the user-visible change precisely. Use `Closes #n`
   for issues addressed and `BREAKING CHANGES:` for any breaking change.
5. Publishing to npm, S3 and GitHub releases happens on merge (`release.yml`). Never run
   `.github/workflows/release/*.sh` or `npm publish`.
