"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState, startTransition } from "react"
import { createClient } from "@/lib/supabase/client"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  const handleToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Persist to database in background (fire-and-forget)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ theme: newTheme })
        .eq("id", user.id)
    }
  }

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 rounded-xl text-muted-foreground cursor-pointer"
      onClick={handleToggle}
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      Alterar Tema
    </Button>
  )
}