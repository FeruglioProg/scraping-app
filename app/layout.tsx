import "./globals.css"

export const metadata = {
  title: "Property Finder Argentina",
  description: "Buscador de propiedades inmobiliarias en Argentina",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
