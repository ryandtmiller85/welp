import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Welp — Registry for Fresh Starts'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 50%, #8B5CF6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
            marginBottom: '24px',
          }}
        >
          welp.
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: 1.3,
            maxWidth: '800px',
            marginBottom: '16px',
          }}
        >
          A registry for fresh starts.
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.4,
            maxWidth: '700px',
          }}
        >
          Because starting over shouldn&apos;t mean starting from scratch.
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '80px',
            fontSize: 22,
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 500,
          }}
        >
          alliswelp.com
        </div>
      </div>
    ),
    { ...size }
  )
}
