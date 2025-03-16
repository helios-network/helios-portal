import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { PortfolioPie } from "./pie"
import s from "./portfolio.module.scss"
import { PortfolioTokens } from "./tokens"

export const Portfolio = () => {
  return (
    <Card className={s.card}>
      <Heading
        icon="hugeicons:wallet-01"
        title="Portfolio overview "
        description="Your assets on Helios"
      >
        <Button icon="hugeicons:download-03" variant="secondary" border />
        <Button icon="hugeicons:upload-03" variant="secondary" border />
      </Heading>
      <div className={s.content}>
        <PortfolioPie />
        <PortfolioTokens />
      </div>
    </Card>
  )
}
