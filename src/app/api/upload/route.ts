import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeSvg } from '@/lib/svgSanitizer';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_MIMES_WITH_SVG = [...ALLOWED_MIMES, 'image/svg+xml'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'customer-uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Arquivo excede o limite máximo permitido de 15MB.' },
        { status: 400 }
      );
    }

    const mime = file.type;
    const isSvg = mime === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    // Validação de tipo MIME
    if (isSvg) {
      if (bucket === 'customer-uploads') {
        // Para uploads de clientes, preferimos formatos raster PNG/JPG/WEBP por segurança e RIP
        return NextResponse.json(
          { success: false, error: 'Para fotos pessoais envie PNG, JPG ou WEBP.' },
          { status: 400 }
        );
      }
    } else if (!ALLOWED_MIMES.includes(mime)) {
      return NextResponse.json(
        { success: false, error: `Formato não suportado (${mime}). Use PNG, JPG, JPEG ou WEBP.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let finalBuffer = buffer;

    // Sanitização de SVG
    if (isSvg) {
      const svgText = buffer.toString('utf-8');
      const { sanitized, isValid, error } = sanitizeSvg(svgText);
      if (!isValid || !sanitized) {
        return NextResponse.json(
          { success: false, error: error || 'Arquivo SVG reprovado na validação de segurança.' },
          { status: 400 }
        );
      }
      finalBuffer = Buffer.from(sanitized, 'utf-8');
    }

    const fileExt = file.name.split('.').pop() || (isSvg ? 'svg' : 'png');
    const sanitizedFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${sanitizedFileName}`;

    let publicUrl = '';

    // Se Supabase Storage estiver ativo, envia para o bucket correspondente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': isSvg ? 'image/svg+xml' : mime,
          },
          body: finalBuffer,
        });

        if (uploadRes.ok) {
          publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
        } else {
          console.warn('Falha no upload Supabase Storage:', uploadRes.status, await uploadRes.text());
        }
      } catch (err) {
        console.warn('Erro ao conectar ao Supabase Storage:', err);
      }
    }

    // Se não tiver Supabase configurado no ambiente, salva no disco local em public/uploads/
    if (!publicUrl) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const diskFilePath = path.join(uploadDir, sanitizedFileName);
      fs.writeFileSync(diskFilePath, finalBuffer);
      publicUrl = `/uploads/${sanitizedFileName}`;
    }

    return NextResponse.json({
      success: true,
      filePath,
      publicUrl,
      fileName: file.name,
      mimeType: isSvg ? 'image/svg+xml' : mime,
      fileSizeBytes: finalBuffer.length,
    });
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao processar upload.' },
      { status: 500 }
    );
  }
}
