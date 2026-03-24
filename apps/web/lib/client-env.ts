import { z } from 'zod';

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string(),
});

export const clientEnv = clientEnvSchema.parse(process.env);
