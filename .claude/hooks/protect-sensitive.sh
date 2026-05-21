#!/usr/bin/env bash
# PreToolUse(Read|Edit|Write): bloqueia acesso a segredos (.env, chaves).
# Arquivos de exemplo (.env.example etc.) continuam liberados.
set -u

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0
base=$(basename "$file")

case "$base" in
  .env.example | .env.sample | .env.template | *.example | *.sample)
    exit 0
    ;;
  .env | .env.* | *.key | *.pem | *.pfx | *.p12 | id_rsa | id_ed25519)
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Arquivo sensivel (%s) bloqueado pela politica do projeto (.claude/hooks/protect-sensitive.sh). Segredos nao devem entrar no contexto."}}\n' "$base"
    exit 0
    ;;
esac
exit 0
