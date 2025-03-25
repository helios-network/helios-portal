import { useLocation } from "react-router-dom"

export const useActive = (href: string): boolean => {
  const location = useLocation()
  
  if (!href) return false
  
  const isExternal = href.startsWith("http")
  const isAnchor = href.startsWith("#")
  
  if (isExternal || isAnchor) return false
  
  return location.pathname === href
}
