import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeSvg } from '@/lib/svgSanitizer';
import { isAuthenticatedAdmin } from '@/lib/auth';

const RASTER_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const PUBLIC_UPLOAD_BUCKET = 'customer-uploads';
const ADMIN_UPLOAD_BUCKETS = new Set(['artworks', 'order-previews']);

function hasExpectedSignature(buffer: Buffer, mime: string): boolean {
  if (mime === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  }
  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === 'image/webp') {
    return buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedBucket = (formData.get('bucket') as string) || PUBLIC_UPLOAD_BUCKET;
    const isAdmin = isAuthenticatedAdmin(request);

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (requestedBucket !== PUBLIC_UPLOAD_BUCKET && !ADMIN_UPLOAD_BUCKETS.has(requestedBucket)) {
      return NextResponse.json({ success: false, error: 'Destino de upload inválido.' }, { status: 400 });
    }

    if (ADMIN_UPLOAD_BUCKETS.has(requestedBucket) && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Acesso administrativo obrigatório.' }, { status: 401 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Arquivo inválido ou acima do limite máximo de 15MB.' },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();
    const isSvg = mime === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (requestedBucket === PUBLIC_UPLOAD_BUCKET && isSvg) {
      return NextResponse.json(
        { success: false, error: 'Para imagens pessoais envie PNG, JPG ou WEBP.' },
        { status: 400 }
      );
    }

    if (!isSvg && !RASTER_MIMES.includes(mime)) {
      return NextResponse.json(
        { success: false, error: 'Formato não suportado. Use PNG, JPG, JPEG ou WEBP.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let finalBuffer = buffer;
    let finalMime = mime;

    if (isSvg) {
      const { sanitized, isValid, error } = sanitizeSvg(buffer.toString('utf-8'));
      if (!isValid || !sanitized) {
        return NextResponse.json(
          { success: false, error: error || 'SVG reprovado na validação de segurança.' },
          { status: 400 }
        );
      }
      finalBuffer = Buffer.from(sanitized, 'utf-8');
      finalMime = 'image/svg+xml';
    } else if (!hasExpectedSignature(buffer, mime)) {
      return NextResponse.json(
        { success: false, error: 'O conteúdo do arquivo não corresponde ao formato informado.' },
        { status: 400 }
      );
    }

    const extension = isSvg
      ? 'svg'
      : mime.includes('png')
        ? 'png'
        : mime.includes('webp')
          ? 'webp'
          : 'jpg';

    const filePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const uploadRes = await fetch(
        `${supabaseUrl}/storage/v1/object/${requestedBucket}/${filePath}`,
        {
          method: 'POST',
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            'Content-Type': finalMime,
            'x-upsert': 'false',
          },
          body: finalBuffer,
        }
      );

      if (!uploadRes.ok) {
        const details = await uploadRes.text();
        console.error('Falha no Supabase Storage:', uploadRes.status, details);
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { success: false, error: 'Não foi possível salvar a imagem agora. Tente novamente.' },
            { status: 503 }
          );
        }
      } else {
        const publicUrl =
          requestedBucket === 'artworks'
            ? `${supabaseUrl}/storage/v1/object/public/${requestedBucket}/${filePath}`
            : null;

        return NextResponse.json({
          success: true,
          filePath,
          storagePath: `${requestedBucket}/${filePath}`,
          publicUrl,
          fileName: file.name,
          mimeType: finalMime,
          fileSizeBytes: finalBuffer.length,
        });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Armazenamento não configurado no ambiente de produção.' },
        { status: 503 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filePath), finalBuffer);

    return NextResponse.json({
      success: true,
      filePath,
      storagePath: `local/${filePath}`,
      publicUrl: `/uploads/${filePath}`,
      fileName: file.name,
      mimeType: finalMime,
      fileSizeBytes: finalBuffer.length,
      developmentFallback: true,
    });
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao processar upload.' },
      { status: 500 }
    );
  }
}
