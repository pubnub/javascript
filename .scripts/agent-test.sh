#!/usr/bin/env bash
# Run a test file, a suite, or any noisy command with filtered output.
#   .scripts/agent-test.sh test/unit/publish/publish.test.ts [--grep '<re>']
#   .scripts/agent-test.sh unit|integration|release|node|web|shared-worker|feature-files|feature-objects|contract [--tags '<expr>']
#   .scripts/agent-test.sh <any command...>          e.g. npm run build:node
# Pass: one line. Fail: matching error lines (<=150) + last 30 lines + path of the full log.
# Exit: the command's status; 2 = blocked (missing prerequisite) or no tests ran.
set -u
cd "$(dirname "$0")/.." || exit 2

blocked() { echo "BLOCKED: $*"; exit 2; }
need() { [ -e "$1" ] || blocked "$1 missing: $2"; }
need_env() { for v in "$@"; do [ -n "${!v:-}" ] || blocked "env $v not set (load test/.env.local, see sdk-test skill)"; done; }
redact() { # mask values of secret-looking env vars in stdin
  local text name val
  text=$(cat)
  for name in $(env | sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' | grep -Ei 'key|token|secret|password'); do
    val=${!name:-}
    [ ${#val} -ge 6 ] && text=${text//"$val"/[REDACTED:$name]}
  done
  printf '%s\n' "$text"
}

[ $# -gt 0 ] || { sed -n '2,7p' "$0"; exit 2; }
major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)
case "$major" in 22|24) ;; *) echo "WARN: Node ${major:-not found}; CI uses 22/24. Startup failures on other majors are environmental." ;; esac

export TS_NODE_PROJECT=./tsconfig.json
# --no-config: otherwise .mocharc.json's spec glob adds the whole suite to an explicit file selection.
MOCHA="npx --no-install mocha --project tsconfig.mocha.json --require tsx --no-config --file test/setup-why.ts --timeout 5000 --reporter dot"
label="$*"
tests=1
case "$1" in
  *.test.ts)
    need node_modules "run npm install"; need "$1" "pass a path relative to the repo root"
    f=$1; shift; set -- $MOCHA "$@" "$f" ;;
  unit|integration|release)
    need node_modules "run npm install"
    [ "$1" = release ] && need lib/types/index.d.ts "run npm run build:node"
    s=$1; shift; set -- $MOCHA --exclude 'test/integration/shared-worker/**' "$@" "test/$s/**/*.test.ts" ;;
  node)
    need node_modules "run npm install"; need lib/types/index.d.ts "run npm run build:node"
    shift; set -- npm run -s test:node -- --reporter dot "$@" ;;
  web)
    need node_modules "run npm install"; need dist/web/pubnub.js "run npm run build:web"
    set -- npm run -s test:web ;;
  shared-worker)
    need node_modules "run npm install"; need dist/web/pubnub.worker.js "run npm run build:web"
    set -- npm run -s test:web:shared-worker ;;
  feature-files)
    need node_modules "run npm install"; need_env PUBLISH_KEY SUBSCRIBE_KEY
    set -- npm run -s test:feature:fileupload:node ;;
  feature-objects)
    need node_modules "run npm install"; need_env PUBLISH_KEY SUBSCRIBE_KEY
    set -- npm run -s test:feature:objectsv2:node ;;
  contract)
    need node_modules "run npm install"; need test/specs "see .agents/skills/sdk-test/contract.md"
    lsof -nP -iTCP:8090 -sTCP:LISTEN >/dev/null 2>&1 || blocked "no mock server on :8090 (npm run contract:server)"
    if [ "${2:-}" = --tags ]; then set -- npx --no-install cucumber-js -p default --tags "${3:?--tags needs a value}"
    else set -- npm run -s test:contract:start; fi ;;
  *) tests=0 ;;
esac

log=$(mktemp "${TMPDIR:-/tmp}/agent-test.XXXXXX")
"$@" >"$log" 2>&1
status=$?
lines=$(wc -l <"$log" | tr -d ' ')
if [ "$tests" = 1 ] && [ "$status" = 0 ] && grep -Eq '^ *0 passing|Executed 0 of 0|^0 scenarios' "$log"; then
  echo "FAIL: no tests ran: $label (full log: $log)"
  exit 2
fi
if [ "$status" = 0 ]; then
  echo "PASS: $label ($lines lines of output suppressed)"
  rm -f "$log"
  exit 0
fi
echo "FAIL (exit $status): $label"
{
  grep -E -A 8 '(failing|AssertionError|Error:|ERROR|FAILED|✗|✕|^ +[0-9]+\) )' "$log" | head -n 150
  echo "--- last 30 lines ---"
  tail -n 30 "$log"
} | redact
echo "Full log ($lines lines): $log (grep/tail it; don't read it whole)"
exit "$status"
