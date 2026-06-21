import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                height: 100%;
                min-height: 100dvh;
                width: 100%;
              }
              body {
                margin: 0;
                overflow: hidden;
                -webkit-font-smoothing: antialiased;
                -webkit-text-size-adjust: 100%;
                touch-action: manipulation;
              }
              * { box-sizing: border-box; }
              @media (min-width: 900px) {
                body { background: #1a1a1e; }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}