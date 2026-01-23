import { createClient } from '@supabase/supabase-js';

const IS_VERCEL = Boolean(process.env.VERCEL);
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'images';

function getSupabaseClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
}

// Supabase Storage에서 랜덤 이미지 선택 (폴더 없이 버킷 루트에서)
async function getRandomImageFromSupabase(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // 버킷 루트에서 직접 파일 목록 가져오기
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 100 });

    if (error || !files || files.length === 0) {
      console.error('[Supabase Storage] List failed:', error);
      return null;
    }

    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f.name) && f.name !== '.emptyFolderPlaceholder'
    );

    if (imageFiles.length === 0) return null;

    const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(randomFile.name);

    return urlData.publicUrl;
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
    return `/workimages/${randomFile}`;
  } catch (error) {
    console.error('Error selecting random image:', error);
    return null;
  }
}

export async function getRandomUserImage(): Promise<string | null> {
  if (IS_VERCEL) {
    return getRandomImageFromSupabase();
  }
  return getRandomImageFromLocal();
}

// 이미지 워터마크 처리 - Vercel에서는 원본 URL 반환, 로컬에서만 sharp 사용
export async function processImageWithWatermark(
  imagePath: string,
  text: string
): Promise<string> {
  const fallbackUrl = '/images/hero.png';

  // Vercel 환경: sharp 없이 원본 이미지 URL 그대로 반환
  if (IS_VERCEL) {
    // imagePath가 이미 Supabase URL이면 그대로 반환
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // 그렇지 않으면 랜덤 이미지 가져오기
    const randomUrl = await getRandomImageFromSupabase();
    return randomUrl || fallbackUrl;
  }

  // 로컬 환경: sharp로 이미지 처리
  try {
    const sharp = (await import('sharp')).default;
    const fs = await import('fs');
    const path = await import('path');

    const fileName = `post-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const outputDir = path.join(process.cwd(), 'public', 'images', 'generated');
    const outputPath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

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

    // imagePath가 URL인 경우 로컬 파일 경로로 변환
    let localPath = imagePath;
    if (imagePath.startsWith('/workimages/')) {
      localPath = path.join(process.cwd(), 'public', imagePath);
    }

    await sharp(localPath)
      .resize(targetWidth, targetHeight, { fit: 'cover' })
      .composite([{ input: Buffer.from(svgOverlay), gravity: 'center' }])
      .webp({ quality: 85 })
      .toFile(outputPath);

    return `/images/generated/${fileName}`;
  } catch (error) {
    console.error('Image processing failed:', error);
    return fallbackUrl;
  }
}
