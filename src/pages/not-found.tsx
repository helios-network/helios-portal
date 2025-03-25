import { Button } from "../shared-components/button"

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Button href="/">Return Dashboard</Button>
    </div>
  )
}
