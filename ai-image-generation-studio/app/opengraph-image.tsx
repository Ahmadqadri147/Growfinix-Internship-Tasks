import { ImageResponse } from 'next/og';

export const alt = 'Growfinix Studio — AI image generation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f3efe5',
          color: '#1b1a15',
          padding: '64px 72px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'monospace',
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: '#7a7567',
          }}
        >
          <span>Growfinix Studio</span>
          <span>AI image generation</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 92, lineHeight: 1, letterSpacing: -3 }}>
            An image studio
          </div>
          <div style={{ display: 'flex', fontSize: 92, lineHeight: 1, letterSpacing: -3 }}>
            for the
            <span style={{ fontStyle: 'italic', color: '#c2461f', marginLeft: 22 }}>
              almost real
            </span>
            .
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '2px solid #d9d2c2',
            paddingTop: 24,
            fontFamily: 'monospace',
            fontSize: 20,
            color: '#4d4a40',
          }}
        >
          <span>FLUX.1 schnell · Directed frames · A searchable archive</span>
          <span style={{ color: '#c2461f' }}>→</span>
        </div>
      </div>
    ),
    size
  );
}
