---
name: sdk-deps
description: Use when upgrading, adding or auditing PubNub JavaScript SDK npm dependencies (npm outdated, npm audit, Dependabot-style bumps). Covers lockfile handling, bundle and platform impact, and validation.
---

# sdk-deps

1. A new runtime dependency needs approval first. Bumps of existing dependencies don't.
2. Change dependencies only through npm, e.g. `npm install <pkg>@<version>`. `package-lock.json` is hook-protected
   from hand edits. Check whether the `overrides` block in `package.json` still applies.
3. Check platform impact:
   - Runtime dependencies ship to Node, browsers and React Native.
   - Verify browser/RN compatibility (no Node built-ins in shared code) and any polyfill requirements.
4. Check bundle impact: run `npm run build:web` and compare the `dist/web/pubnub.min.js` size against `master`. Report
   any growth.
5. Validate with `.scripts/agent-test.sh node`, and with `web` when browser code is affected. Each source PR also
   commits rebuilt artifacts ([sdk-release](../sdk-release/SKILL.md)).
6. Triaging `npm outdated` or `npm audit` output is mechanical; give it to a light-model subagent. Report the
   versions changed and the risk.
