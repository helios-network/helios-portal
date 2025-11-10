import { Area, Grid } from "@/components/grid"
import { Interface } from "./(components)/interface"
import { Recents } from "./(components)/recents"
import { Secure } from "./(components)/secure"
import { Supported } from "./(components)/supported"
import s from "./page.module.scss"
import { AccountRecents } from "./(components)/accountrecents"
// import { Message } from "@/components/message"

export default function Page() {
  // return (
  //   <Message title="Bridge temporarily unavailable" variant="danger">
  //     The cross-chain bridge is temporarily disabled for maintenance. It will be
  //     back soon.
  //   </Message>
  // )

 return (
   <>
     <Grid className={s.bridge}>
       <Area area="a">
         <Interface />
       </Area>
       <Area area="b">
         <Supported />
       </Area>
       <Area area="c">
         <Recents />
       </Area>
       <Area area="d">
         <AccountRecents />
       </Area>
       <Area area="e">
         <Secure />
       </Area>
     </Grid>
   </>
 )
}
