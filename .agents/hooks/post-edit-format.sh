#!/bin/bash
# PostToolUse hook, matcher: Edit|Write|MultiEdit. Formats the edited file in place.
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0
root=${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}
rel=${file#"$root"/}
cd "$root" || exit 0
case "$rel" in
  src/*.ts|src/*.js)
    # eslint-plugin-prettier applies prettier as part of --fix.
    npx --no-install eslint --fix --config .eslintrc.cjs "$rel" >&2 || exit 2 ;;
  test/*.ts|test/*.js)
    npx --no-install prettier --write "$rel" >/dev/null ;;
esac
exit 0
