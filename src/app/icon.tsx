import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Icon generation
export default function Icon() {
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
            fontSize: 22,
            fontWeight: 700,
            color: '#3B5335',
            fontFamily: 'cursive',
            display: 'flex',
            marginTop: '2px',
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
