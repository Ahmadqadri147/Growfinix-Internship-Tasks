import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

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
          background: '#1b1a15',
          color: '#f3efe5',
          fontFamily: 'Georgia, serif',
          fontSize: 320,
          position: 'relative',
        }}
      >
        G
        <div
          style={{
            position: 'absolute',
            right: 64,
            bottom: 64,
            width: 44,
            height: 44,
            background: '#c2461f',
          }}
        />
      </div>
    ),
    size
  );
}
