import Navbar from "../components/Navbar.tsx"
import Footer from "../components/Footer.tsx"

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
