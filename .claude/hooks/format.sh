#!/usr/bin/env bash
# PostToolUse(Write|Edit): formata o arquivo recém-tocado com Biome.
# Roda só em extensões que o Biome formata; nunca falha o turno.
set -u

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.jsonc | *.css) ;;
  *) exit 0 ;;
esac

npx @biomejs/biome format --write "$file" >/dev/null 2>&1 || true
exit 0
