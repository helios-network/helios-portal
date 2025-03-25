import NextTopLoader from "nextjs-toploader"
import { Toaster } from "sonner"
import { Header } from "../header"
import s from "./wrapper.module.scss"

interface WrapperProps {
  children: React.ReactNode
}

export const Wrapper = ({ children }: WrapperProps) => {
  return (
    <>
      <Header />
      <main className={s.main}>{children}</main>
      <NextTopLoader
        color="var(--primary-medium)"
        height={2}
        showSpinner={false}
        zIndex={9999}
      />
      <Toaster
        position="bottom-right"
        visibleToasts={3}
        toastOptions={{
          className: s.toast
        }}
      />
      <div id="modal-root" />
    </>
  )
}
