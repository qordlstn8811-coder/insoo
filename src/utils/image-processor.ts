import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const IS_VERCEL = Boolean(process.env.VERCEL);
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || '';
const STORAGE_PREFIX = process.env.SUPABASE_STORAGE_PREFIX || 'generated';
const WORKIMAGES_PREFIX = process.env.SUPABASE_WORKIMAGES_PREFIX || 'workimages';
const PUBLIC_OUTPUT_PREFIX = '/images/generated';

function getSupabaseClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
}

async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !STORAGE_BUCKET) return null;

  const objectPath = `${STORAGE_PREFIX}/${fileName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, buffer, { contentType: 'image/webp', upsert: true });

  if (error) {
    console.error('[Supabase Storage] Upload failed:', error);
    return null;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return data?.publicUrl || null;
}

// Vercel: Supabase Storage에서 랜덤 이미지 선택
async function getRandomImageFromSupabase(): Promise<{ url: string; buffer: Buffer } | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !STORAGE_BUCKET) return null;

  try {
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(WORKIMAGES_PREFIX, { limit: 100 });

    if (error || !files || files.length === 0) {
      console.error('[Supabase Storage] List failed:', error);
      return null;
    }

    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f.name) && f.name !== '.emptyFolderPlaceholder'
    );

    if (imageFiles.length === 0) return null;

    const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const filePath = `${WORKIMAGES_PREFIX}/${randomFile.name}`;

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('[Supabase Storage] Download failed:', downloadError);
      return null;
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return { url: urlData.publicUrl, buffer };
  } catch (error) {
    console.error('[Supabase Storage] Error:', error);
    return null;
  }
}

// 로컬: 파일시스템에서 랜덤 이미지 선택
async function getRandomImageFromLocal(): Promise<string | null> {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const uploadDir = path.join(process.cwd(), 'public', 'workimages');

    if (!fs.existsSync(uploadDir)) return null;

    const files = fs.readdirSync(uploadDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (files.length === 0) return null;

    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(uploadDir, randomFile);
  } catch (error) {
    console.error('Error selecting random image:', error);
    return null;
  }
}

export async function getRandomUserImage(): Promise<string | null> {
  if (IS_VERCEL) {
    const result = await getRandomImageFromSupabase();
    return result?.url || null;
  }
  return getRandomImageFromLocal();
}

export async function processImageWithWatermark(
  imagePath: string,
  text: string
): Promise<string> {
  const fileName = `post-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
  const fallbackUrl = '/images/hero.png';

  const targetWidth = 800;
  const targetHeight = 600;

  const svgOverlay = `
    <svg width="${targetWidth}" height="${targetHeight}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.7" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <style>
        .title { fill: white; font-size: ${targetWidth * 0.055}px; font-weight: 900; filter: url(#shadow); font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
        .brand-bar { fill: rgba(0,0,0,0.5); }
        .brand-text { fill: #ffffff; font-size: ${targetWidth * 0.035}px; font-weight: bold; font-family: sans-serif; }
        .highlight { fill: #00FF00; }
      </style>

      <!-- Center Title with Strong Shadow -->
      <text x="50%" y="45%" text-anchor="middle" class="title" dominant-baseline="middle">${text}</text>

      <!-- Bottom Branding Bar -->
      <rect x="0" y="${targetHeight * 0.85}" width="${targetWidth}" height="${targetHeight * 0.1}" class="brand-bar" />
      <text x="50%" y="${targetHeight * 0.91}" text-anchor="middle" class="brand-text">
        전북배관 <tspan class="highlight">010-8184-3496</tspan>
      </text>
    </svg>
  `;

  try {
    if (IS_VERCEL) {
      // Vercel: Supabase에서 이미지 다운로드 후 처리
      const imageData = await getRandomImageFromSupabase();
      if (!imageData) return fallbackUrl;

      const pipeline = sharp(imageData.buffer)
        .resize(targetWidth, targetHeight, { fit: 'cover' })
        .composite([{ input: Buffer.from(svgOverlay), gravity: 'center' }])
        .webp({ quality: 85 });

      const buffer = await pipeline.toBuffer();
      const uploadedUrl = await uploadToSupabase(buffer, fileName);
      return uploadedUrl || fallbackUrl;
    } else {
      // 로컬: 파일시스템 사용
      const fs = await import('fs');
      const path = await import('path');

      const outputDir = path.join(process.cwd(), 'public', 'images', 'generated');
      const outputPath = path.join(outputDir, fileName);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const pipeline = sharp(imagePath)
        .resize(targetWidth, targetHeight, { fit: 'cover' })
        .composite([{ input: Buffer.from(svgOverlay), gravity: 'center' }])
        .webp({ quality: 85 });

      await pipeline.toFile(outputPath);
      return `${PUBLIC_OUTPUT_PREFIX}/${fileName}`;
    }
  } catch (error) {
    console.error('Image processing failed:', error);
    return fallbackUrl;
  }
}
