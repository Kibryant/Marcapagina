'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

interface GoogleSignInButtonProps {
  /** Rótulo dentro do botão. Default: "Continuar com Google". */
  label?: string;
  /** Para onde mandar depois do callback. Default: /app. */
  redirectTo?: string;
}

/**
 * Botão de login com Google via Supabase OAuth.
 *
 * O `redirectTo` é resolvido contra `window.location.origin` para passar
 * no allowlist do Supabase (que precisa do origin completo). Após o
 * callback do Google, a rota /auth/callback troca o code por sessão.
 */
export function GoogleSignInButton({
  label = 'Continuar com Google',
  redirectTo = '/app',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback,
        // Pede consentimento explícito sempre — fluxo mais previsível
        // do que silent re-auth, e segura usuário que troca de conta.
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) {
      setLoading(false);
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      });
    }
    // Em caso de sucesso, o browser é redirecionado pro Google.
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="w-full h-12 rounded-xl border-border/50 bg-background/50 hover:bg-background font-bold text-base gap-3"
    >
      <GoogleIcon className="h-5 w-5" />
      {loading ? 'Redirecionando…' : label}
    </Button>
  );
}

// SVG do logo do Google nas cores oficiais. Inline pra evitar dependência
// extra; copiado das guidelines do "Sign in with Google" da Google.
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.3-.1-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.1 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.7 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2c-.4.4 6.6-4.8 6.6-14.7 0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
