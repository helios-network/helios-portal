import { useLocation } from "react-router-dom"

export const useActive = (href?: string): boolean => {
  const { pathname } = useLocation()
  
  if (!href) return false

  if (href === "/" && pathname === "/") {
    return true
  }

  if (href !== "/" && pathname.includes(href)) {
    return true
  }

  return false
}
