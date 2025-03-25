import { APP_NAME } from "../config/app"

export const setPageTitle = (title: string) => {
  document.title = `${APP_NAME}: ${title}`
}
