#!/bin/bash
# Stop hook. Don't let the agent finish with a failing type check. Keep it under ~30 s.
# Stop hooks receive JSON on stdin; if this run was already continued by a hook, let the agent finish to avoid a loop.
[ "$(jq -r ".stop_hook_active // false" 2>/dev/null)" = true ] && exit 0
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}" || exit 0
[ -n "$(git status --porcelain -- src test 2>/dev/null)" ] || exit 0 # no TypeScript changed
if [ ! -x node_modules/.bin/tsc ]; then
  echo "quick-check skipped: node_modules missing (run npm ci)" >&2
  exit 0
fi
if ! out=$(npm run -s typecheck 2>&1); then
  echo "Type check failed. Fix it before finishing:" >&2
  echo "$out" | tail -n 40 >&2
  exit 2
fi
exit 0
