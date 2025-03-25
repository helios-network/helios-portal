import { APP_THEME_COLOR } from "./config/app"
import "@/styles/globals.scss"
import { Wrapper } from "./components/wrapper"
import { fonts } from "./fonts"

export const viewport = {
  themeColor: APP_THEME_COLOR
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={fonts}>
        <Wrapper>{children}</Wrapper>
      </body>
    </html>
  )
}
