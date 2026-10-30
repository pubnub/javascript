#!/usr/bin/env bash
# Lint the agent harness: size limits, skill frontmatter, relative links, referenced paths and npm scripts.
# Runs in pre-commit when AGENTS.md, .agents/ or .scripts/ change. Prints OK or one line per error.
cd "$(dirname "$0")/.." || exit 2
err=0
fail() { echo "ERROR: $*"; err=1; }

files="AGENTS.md $(find .agents -name '*.md' | sort)"
[ "$(wc -l <AGENTS.md)" -le 200 ] || fail "AGENTS.md exceeds 200 lines"

for s in .agents/skills/*/SKILL.md; do
  d=$(basename "$(dirname "$s")")
  [ "$(wc -l <"$s")" -le 500 ] || fail "$s exceeds 500 lines"
  [ "$(sed -n 1p "$s")" = --- ] || fail "$s: missing YAML frontmatter"
  grep -qx "name: $d" "$s" || fail "$s: frontmatter name must be '$d'"
  grep -Eq '^description: .{20,}' "$s" || fail "$s: description missing or too short"
done

for f in $files; do
  dir=$(dirname "$f")
  for link in $(grep -oE '\]\([^)#[:space:]]+' "$f" | sed 's/^](//'); do
    case "$link" in http*|mailto:*) continue ;; esac
    [ -e "$dir/$link" ] || fail "$f: broken link $link"
  done
  for p in $(grep -oE '`\.(scripts|agents)/[^` ]+' "$f" | tr -d '`'); do
    [ -e "$p" ] || fail "$f: missing path $p"
  done
  for s in $(grep -oE 'npm run (-s )?[a-z][a-z0-9:-]*' "$f" | awk '{print $NF}'); do
    grep -q "\"$s\":" package.json || fail "$f: unknown npm script $s"
  done
done

[ "$err" = 0 ] && echo "OK: agent docs ($(echo $files | wc -w | tr -d ' ') files)"
exit "$err"
