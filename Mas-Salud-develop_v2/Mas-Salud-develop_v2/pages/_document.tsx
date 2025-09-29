import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/icono.webp" />
        <meta name="description" content="Sistema de gestión Mas Salud" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}