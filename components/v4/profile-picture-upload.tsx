"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfilePictureUploadProps {
  currentAvatarUrl: string | null;
  displayName: string | null;
  onUploadSuccess: (url: string) => void;
}

export function ProfilePictureUpload({ currentAvatarUrl, displayName, onUploadSuccess }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`; // Saved in avatars bucket root

      if (file.size > 2 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 2MB.");
      }

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      if (data.publicUrl) {
        onUploadSuccess(data.publicUrl);
        toast({ title: "Sucesso", description: "Foto de perfil atualizada!" });
      }

    } catch (error) {
      if (error instanceof Error) {
        toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Erro no upload", description: "Erro inesperado", variant: "destructive" });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-primary/20 bg-muted">
          <AvatarImage
            src={currentAvatarUrl || ""}
            alt={displayName || "Avatar"}
            className="object-cover"
          />
          <AvatarFallback className="text-2xl font-bold text-muted-foreground bg-primary/5">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {/* Overlay Hover */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity cursor-pointer ${uploading ? 'opacity-100' : 'group-hover:opacity-100'}`}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
        </div>
      </div>

      <div className="text-center sm:text-left space-y-2">
        <h3 className="font-bold">Sua Foto</h3>
        <p className="text-xs text-muted-foreground">JPG, GIF ou PNG. Máximo 2MB.</p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif, image/webp"
          className="hidden"
        />

        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Enviando..." : currentAvatarUrl ? "Trocar Foto" : "Fazer Upload"}
        </Button>
      </div>
    </div>
  );
}
