import { Button } from "../../../../shared-components/button"
import { Card } from "../../../../shared-components/card"
import { Sprite } from "../../../../shared-components/sprite"
import { EXPLORER_URL } from "../../../../config/app"
import s from "./discover.module.scss"

export const Discover = () => {
  return (
    <Card className={s.discover}>
      <Sprite id="logotype-explorer" viewBox="0 0 166 26" className={s.logo} />
      <div className={s.bottom}>
        <p>
          Discover our
          <br />
          explorer
        </p>
        <Button
          href={EXPLORER_URL}
          icon="hugeicons:arrow-right-02"
          border
          size="small"
          className={s.btn}
        />
      </div>
    </Card>
  )
}
