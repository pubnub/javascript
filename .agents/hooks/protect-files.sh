#!/bin/bash
# PreToolUse hook, matcher: Edit|Write|MultiEdit|NotebookEdit. Blocks agent edits to protected paths.
# Known gap: edits made through Bash (sed -i, redirects) bypass this hook.
file=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')
[ -n "$file" ] || exit 0
root=${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}
rel=${file#"$root"/}
name=${rel##*/}
why=
case "$rel" in
  lib/*|dist/*) why="generated build output; change src/ and run npm run build:node / build:web" ;;
  package-lock.json) why="change it through npm install, not by hand" ;;
  CHANGELOG.md|.pubnub.yml) why="written by the release bot from the PR description" ;;
  test/specs/*) why="external checkout replaced by npm run test:contract:prepare" ;;
  .agents/hooks/*|.pre-commit-config.yaml|.github/workflows/*) why="guardrail/CI configuration" ;;
  secrets/*|*/secrets/*) why="may contain secrets" ;;
esac
case "$name" in .env|.env.*|*.env|*.pem|*.key) why="may contain secrets" ;; esac
if [ -n "$why" ]; then
  echo "Blocked: $rel is protected ($why). Ask a human to change it." >&2
  exit 2
fi
exit 0
