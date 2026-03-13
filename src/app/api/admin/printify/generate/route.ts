import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { uploadImageBase64 } from '@/lib/printify'

// Admin auth check
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

// --------------------------------------------------------------------------
// SVG-based design generators
// --------------------------------------------------------------------------

function svgWordmark(
  w: number,
  h: number,
  text: string,
  color: string,
  fontSize: number,
  fontWeight: number = 900,
): string {
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${w / 2}" y="${h / 2}"
      font-family="Helvetica, Arial, sans-serif"
      font-weight="${fontWeight}"
      font-size="${fontSize}"
      fill="${color}"
      text-anchor="middle"
      dominant-baseline="central"
      letter-spacing="10">${text}</text>
  </svg>`
}

function svgCenteredText(
  w: number,
  h: number,
  mainText: string,
  subText: string,
  color: string,
  mainSize: number,
  subSize: number,
  gap: number = 80,
): string {
  const mainY = h / 2 - gap / 2
  const subY = h / 2 + gap / 2 + subSize * 0.3
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${w / 2}" y="${mainY}"
      font-family="Helvetica, Arial, sans-serif"
      font-weight="900"
      font-size="${mainSize}"
      fill="${color}"
      text-anchor="middle"
      dominant-baseline="central">${mainText}</text>
    <text x="${w / 2}" y="${subY}"
      font-family="Helvetica, Arial, sans-serif"
      font-weight="400"
      font-size="${subSize}"
      fill="${color}"
      text-anchor="middle"
      dominant-baseline="central"
      letter-spacing="8">${subText}</text>
  </svg>`
}

function svgMultiline(
  w: number,
  h: number,
  lines: string[],
  attribution: string,
  color: string,
  lineSize: number,
  attrSize: number,
  lineGap: number = 40,
  attrGap: number = 100,
): string {
  const totalLines = lines.length
  const totalH = totalLines * lineSize + (totalLines - 1) * lineGap + attrGap + attrSize
  const startY = (h - totalH) / 2 + lineSize * 0.35

  const lineElements = lines
    .map((line, i) => {
      const y = startY + i * (lineSize + lineGap)
      return `<text x="${w / 2}" y="${y}"
        font-family="Helvetica, Arial, sans-serif"
        font-weight="900"
        font-size="${lineSize}"
        fill="${color}"
        text-anchor="middle"
        dominant-baseline="central">${line}</text>`
    })
    .join('\n')

  const attrY = startY + totalLines * (lineSize + lineGap) + attrGap
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    ${lineElements}
    <text x="${w / 2}" y="${attrY}"
      font-family="Helvetica, Arial, sans-serif"
      font-weight="400"
      font-size="${attrSize}"
      fill="${color}"
      text-anchor="middle"
      dominant-baseline="central">${attribution}</text>
  </svg>`
}

function svgSticker(
  size: number,
  text: string,
  bgColor: string,
  textColor: string,
  fontSize: number = 300,
): string {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.467 // ~700/1500

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgColor}" />
    <text x="${cx}" y="${cy}"
      font-family="Helvetica, Arial, sans-serif"
      font-weight="900"
      font-size="${fontSize}"
      fill="${textColor}"
      text-anchor="middle"
      dominant-baseline="central">${text}</text>
  </svg>`
}

// --------------------------------------------------------------------------
// Design specifications
// --------------------------------------------------------------------------

interface DesignSpec {
  fileName: string
  width: number
  height: number
  svgGenerator: () => string
}

const TEE = { width: 4500, height: 5400 }
const HAT = { width: 2400, height: 1200 }
const MUG = { width: 2700, height: 1100 }
const TOTE = { width: 3600, height: 3600 }
const STICKER = { width: 1500, height: 1500 }

const rgba = (r: number, g: number, b: number) => `rgb(${r},${g},${b})`
const WHITE = rgba(255, 255, 255)
const DARK = rgba(15, 23, 42)
const GRAY = rgba(209, 213, 219)
const ROSE_PINK = rgba(253, 164, 175)
const DARK_ROSE = rgba(159, 18, 57)
const ROSE = rgba(244, 63, 94)

const DESIGNS: DesignSpec[] = [
  // TEES & SWEATSHIRTS
  {
    fileName: 'welp_wordmark_white.png',
    ...TEE,
    svgGenerator: () => svgWordmark(TEE.width, TEE.height, 'welp.', WHITE, 900),
  },
  {
    fileName: 'welp_wordmark_dark.png',
    ...TEE,
    svgGenerator: () => svgWordmark(TEE.width, TEE.height, 'welp.', DARK, 900),
  },
  {
    fileName: 'tee_start_over.png',
    ...TEE,
    svgGenerator: () =>
      svgCenteredText(TEE.width, TEE.height, 'welp.', 'TIME TO START OVER', WHITE, 900, 280, 120),
  },
  {
    fileName: 'crew_spite.png',
    ...TEE,
    svgGenerator: () =>
      svgCenteredText(TEE.width, TEE.height, 'Built with spite', 'and love.', GRAY, 500, 400, 80),
  },
  {
    fileName: 'tee_kept_pots.png',
    ...TEE,
    svgGenerator: () =>
      svgMultiline(TEE.width, TEE.height, ['They got', 'the pots.'], '— welp.', ROSE_PINK, 700, 350, 50, 120),
  },
  {
    fileName: 'crew_funded.png',
    ...TEE,
    svgGenerator: () =>
      svgMultiline(
        TEE.width,
        TEE.height,
        ['This sweatshirt', 'was funded by', 'my friends.'],
        'welp.',
        DARK_ROSE,
        500,
        350,
        40,
        100,
      ),
  },
  {
    fileName: 'tee_main_character.png',
    ...TEE,
    svgGenerator: () =>
      svgCenteredText(TEE.width, TEE.height, 'MAIN CHARACTER', 'ENERGY  ✦  SINCE 2026', DARK, 650, 280, 80),
  },
  // HATS
  {
    fileName: 'hat_welp_white.png',
    ...HAT,
    svgGenerator: () => svgWordmark(HAT.width, HAT.height, 'welp.', WHITE, 500),
  },
  // MUGS
  {
    fileName: 'mug_welp_dark.png',
    ...MUG,
    svgGenerator: () => svgWordmark(MUG.width, MUG.height, 'welp.', DARK, 450),
  },
  {
    fileName: 'mug_still_here.png',
    ...MUG,
    svgGenerator: () =>
      svgCenteredText(MUG.width, MUG.height, 'welp.', 'still here. still good.', WHITE, 400, 180, 60),
  },
  // TOTES
  {
    fileName: 'tote_welp_dark.png',
    ...TOTE,
    svgGenerator: () => svgWordmark(TOTE.width, TOTE.height, 'welp.', rgba(26, 26, 26), 800),
  },
  // STICKERS
  {
    fileName: 'sticker_welp_rose.png',
    ...STICKER,
    svgGenerator: () => svgSticker(STICKER.width, 'welp.', ROSE, WHITE, 380),
  },
]

/**
 * POST /api/admin/printify/generate
 *
 * Generates all design images server-side using sharp + SVG,
 * then uploads each to Printify. Returns array of image IDs.
 *
 * Optional body: { designs?: string[] } — filter to specific filenames
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let filterDesigns: string[] | null = null
  try {
    const body = await req.json()
    if (body.designs && Array.isArray(body.designs)) {
      filterDesigns = body.designs
    }
  } catch {
    // No body or invalid JSON — generate all
  }

  const toGenerate = filterDesigns
    ? DESIGNS.filter((d) => filterDesigns!.includes(d.fileName))
    : DESIGNS

  const results: Array<{
    fileName: string
    imageId?: string
    previewUrl?: string
    error?: string
  }> = []

  for (const design of toGenerate) {
    try {
      // Generate SVG
      const svg = design.svgGenerator()

      // Render SVG to PNG using sharp
      const pngBuffer = await sharp({
        create: {
          width: design.width,
          height: design.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([
          {
            input: Buffer.from(svg),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer()

      // Upload to Printify as base64
      const base64 = pngBuffer.toString('base64')
      const image = await uploadImageBase64(design.fileName, base64)

      results.push({
        fileName: design.fileName,
        imageId: image.id,
        previewUrl: image.preview_url,
      })
    } catch (err: any) {
      results.push({
        fileName: design.fileName,
        error: err.message || 'Generation failed',
      })
    }
  }

  return NextResponse.json({
    total: toGenerate.length,
    uploaded: results.filter((r) => r.imageId).length,
    failed: results.filter((r) => r.error).length,
    results,
  })
}
