import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Apple Icon generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFAF50',
          borderRadius: '50%',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: '#3B5335',
            fontFamily: 'cursive',
            display: 'flex',
            marginTop: '8px',
          }}
        >
          hi
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
