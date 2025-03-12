export default function Head() {
  return (
    <>
      <title>My App</title>
      <meta name="description" content="My amazing Next.js app" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      {/* Inline script to set theme before page render */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
        }}
      />
    </>
  );
}
