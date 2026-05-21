#!/usr/bin/env bash
# PreToolUse(Bash): barra comandos destrutivos antes de executarem.
# Rede de seguranca — não substitui revisão humana.
set -u

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -n "$cmd" ] || exit 0

block() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

# rm recursivo/forcado apontando para raiz, home, curinga ou diretorio atual
if printf '%s' "$cmd" | grep -Eq 'rm[[:space:]]+(-[A-Za-z]*([rR][A-Za-z]*f|f[A-Za-z]*[rR])|--recursive)'; then
  if printf '%s' "$cmd" | grep -Eq '[[:space:]](/|~|\$HOME|\*)|[[:space:]]\.\.?([[:space:]]|$)'; then
    block "rm recursivo/forcado em caminho amplo (/, ~, *, .) bloqueado. Apague paths especificos."
  fi
fi

# git push --force (--force-with-lease continua permitido)
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push' && printf '%s' "$cmd" | grep -Eq '[[:space:]](-f|--force)([[:space:]]|$)'; then
  block "git push --force bloqueado. Use --force-with-lease e confirme manualmente."
fi

# git reset --hard
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+reset[[:space:]].*--hard'; then
  block "git reset --hard bloqueado. Confirme manualmente se for mesmo intencional."
fi

# git clean forcado
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+clean[[:space:]]+-[A-Za-z]*f'; then
  block "git clean -f bloqueado. Pode apagar arquivos nao rastreados."
fi

# leitura de segredos via shell
if printf '%s' "$cmd" | grep -Eq '(^|[;&|]|[[:space:]])(cat|bat|less|more|head|tail|nl|xxd|strings)[[:space:]][^|;&]*\.(env|key|pem|pfx)([[:space:]"'"'"']|$)'; then
  block "Leitura de arquivo sensivel (.env/.key/.pem) via shell bloqueada. Use variaveis de ambiente."
fi

exit 0
