import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'workimages');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'generated');
const PUBLIC_OUTPUT_PREFIX = '/images/generated';
const FALLBACK_PUBLIC_PREFIX = '/workimages';
const IS_VERCEL = Boolean(process.env.VERCEL);
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || '';
const STORAGE_PREFIX = process.env.SUPABASE_STORAGE_PREFIX || 'generated';

function ensureOutputDir(): void {
  if (IS_VERCEL) return;
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function getFallbackPublicUrl(imagePath: string): string {
  return `${FALLBACK_PUBLIC_PREFIX}/${path.basename(imagePath)}`;
}

async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY || !STORAGE_BUCKET) return null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
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

export async function getRandomUserImage(): Promise<string | null> {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return null;

    const files = fs.readdirSync(UPLOAD_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (files.length === 0) return null;

    // Random selection
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(UPLOAD_DIR, randomFile);
  } catch (error) {
    console.error('Error selecting random image:', error);
    return null;
  }
}

export async function processImageWithWatermark(
  imagePath: string,
  text: string
): Promise<string> {
  const fileName = `post-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
  const outputPath = path.join(OUTPUT_DIR, fileName);
  const fallbackUrl = getFallbackPublicUrl(imagePath);

  try {
    const image = sharp(imagePath);

    // SVG Overlay for dynamic text watermark with 2026 Premium Aesthetics
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

    const pipeline = image
      .resize(targetWidth, targetHeight, { fit: 'cover' }) // Standardize size
      .composite([{ input: Buffer.from(svgOverlay), gravity: 'center' }])
      .webp({ quality: 85 });

    if (IS_VERCEL) {
      const buffer = await pipeline.toBuffer();
      const uploadedUrl = await uploadToSupabase(buffer, fileName);
      return uploadedUrl || fallbackUrl;
    }

    ensureOutputDir();
    await pipeline.toFile(outputPath);
    return `${PUBLIC_OUTPUT_PREFIX}/${fileName}`;
  } catch (error) {
    console.error('Image processing failed:', error);
    if (IS_VERCEL) return fallbackUrl;

    // Fallback to original image if processing fails (copying it to public accessible)
    try {
      const fallbackName = `fallback-${path.basename(imagePath)}`;
      const fallbackPath = path.join(OUTPUT_DIR, fallbackName);
      ensureOutputDir();
      fs.copyFileSync(imagePath, fallbackPath);
      return `${PUBLIC_OUTPUT_PREFIX}/${fallbackName}`;
    } catch (copyError) {
      console.error('Fallback image copy failed:', copyError);
      return fallbackUrl;
    }
  }
}
