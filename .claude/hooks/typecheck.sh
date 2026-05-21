#!/usr/bin/env bash
# Stop: roda o type-check do app web e avisa (sem bloquear) se houver erro.
set -u

root="${CLAUDE_PROJECT_DIR:-.}"
cd "$root/apps/web" 2>/dev/null || exit 0

log=$(mktemp 2>/dev/null || echo /tmp/mp-tsc.log)
if ! npx tsc --noEmit >"$log" 2>&1; then
  count=$(grep -c 'error TS' "$log" 2>/dev/null || echo '?')
  printf '{"systemMessage":"type-check (apps/web) falhou: %s erro(s) de tipo. Rode `cd apps/web && npx tsc --noEmit`."}\n' "$count"
fi
rm -f "$log" 2>/dev/null || true
exit 0
