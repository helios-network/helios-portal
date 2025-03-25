import { APP_BASE_URL, APP_NAME } from "../config/app"
import type { Metadata } from "next"

interface MetadataSeoProps {
  title: string
  description: string
}

export const MetadataSeo = ({
  title,
  description
}: MetadataSeoProps): Metadata => {
  const headTitle = `${APP_NAME} | ${title}`

  return {
    metadataBase: APP_BASE_URL,
    title: headTitle,
    description,
    openGraph: {
      title: headTitle,
      description,
      type: "website",
      siteName: APP_NAME,
      locale: "en",
      url: APP_BASE_URL,
      images: [
        {
          url: "/img/thumbnail.jpg",
          alt: description
        }
      ]
    }
  }
}
