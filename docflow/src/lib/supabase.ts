import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadPDF(
  buffer: Buffer,
  path: string
): Promise<string> {
  const { error } = await supabase.storage
    .from("documents")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });
  
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  
  const { data } = supabase.storage
    .from("documents")
    .getPublicUrl(path);
    
  return data.publicUrl;
}
