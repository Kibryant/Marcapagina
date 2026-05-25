'use client';

import { updateProfile } from '@marcapagina/data';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { startTransition, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    // Troca visual imediata — next-themes atualiza a classe do <html> e o
    // localStorage de forma síncrona.
    setTheme(newTheme);

    // Persistência no Supabase é best-effort e não bloqueia o clique.
    void (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await updateProfile(supabase, user.id, { theme: newTheme });
      } catch {
        // ignora — o tema já está aplicado localmente
      }
    })();
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 rounded-xl text-muted-foreground cursor-pointer"
      onClick={handleToggle}
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      Alterar Tema
    </Button>
  );
}
