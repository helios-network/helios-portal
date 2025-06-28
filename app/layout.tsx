import { APP_THEME_COLOR } from "@/config/app"
import { MetadataSeo } from "@/lib/metadata"
import "@/styles/globals.scss"
import { Wrapper } from "./(components)/wrapper"
import { fonts } from "./fonts"
import ContextProvider from "@/context"
import { headers } from "next/headers"
import { NewsBanner } from "./(components)/news-banner"

export const metadata = MetadataSeo({
  title: "Your Gateway to Staking, Delegation & Cross-Chain Governance",
  description:
    "Enter the Helios Portal — your unified access point for staking, delegation, cross-chain governance, and token bridging. Power the next era of decentralized coordination."
})

export const viewport = {
  themeColor: APP_THEME_COLOR
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = (await headers()).get("cookie")

  return (
    <html lang="en" dir="ltr">
      <head suppressHydrationWarning={true}>
        {/* Microsoft Clarity */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "qutl6qmes1");`
          }}
        />
        {/* Google Tag Manager */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RHJMTZBRG1"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RHJMTZBRG1');`
          }}
        />
      </head>
      <body className={fonts} style={{ paddingTop: 60 }}>
        <NewsBanner />
        <ContextProvider cookies={cookies}>
          <Wrapper>{children}</Wrapper>
        </ContextProvider>
      </body>
    </html>
  )
}
