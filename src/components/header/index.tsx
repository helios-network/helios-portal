import { Link } from "../../shared-components/link"
import { Logotype } from "../../shared-components/logotype"
import routes from "../../config/routes"
import { Chains } from "../chains"
import { Nav } from "../nav"
import { Wallet } from "../wallet"
import s from "./header.module.scss"

export const Header = () => {
  return (
    <header className={s.header}>
      <Link className={s.logotype} href={routes.dashboard}>
        <Logotype />
      </Link>
      <Nav />
      <div className={s.right}>
        <Chains />
        <Wallet />
      </div>
    </header>
  )
}
