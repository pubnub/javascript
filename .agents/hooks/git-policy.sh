#!/bin/bash
# PreToolUse hook, matcher: Bash. Blocks force-push (incl. +refspec) and skipped git hooks. Allows --force-with-lease.
# Known false positive: a commit message containing " -n " is also blocked; the agent can rephrase.
cmd=$(jq -r '.tool_input.command // empty')
if echo "$cmd" | grep -Eq 'git +(push|commit).* --no-verify|git +push.*( -f| --force)( |$)|git +push.* \+[^ ]|git +commit.* -n( |$)'; then
  echo "Blocked by repo policy: force-push and --no-verify are not allowed. Ask a human." >&2
  exit 2
fi
exit 0
