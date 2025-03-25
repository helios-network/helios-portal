import { APP_THEME_COLOR } from "../config/app"
import { MetadataSeo } from "../lib/metadata"
import { Wrapper } from "../components/wrapper"
import ContextProvider from "../context"
import { NewsBanner } from "../components/news-banner"
import { Outlet } from "react-router-dom"

export const metadata = MetadataSeo({
  title: "Your Gateway to Staking, Delegation & Cross-Chain Governance",
  description:
    "Enter the Helios Portal — your unified access point for staking, delegation, cross-chain governance, and token bridging. Power the next era of decentralized coordination."
})

export const viewport = {
  themeColor: APP_THEME_COLOR
}

export default function RootLayout({
  children
}: Readonly<{
  children?: React.ReactNode
}>) {
  // Récupération des cookies sans la méthode Next.js
  const cookies = document.cookie // Utilisation de l'API standard du navigateur

  return (
    <>
      <NewsBanner />
      <ContextProvider cookies={cookies}>
        <Wrapper>{children || <Outlet/>}</Wrapper>
      </ContextProvider>
    </>
  )
}
