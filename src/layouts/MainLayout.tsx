import Navbar from "../components/Navbar/Navbar.tsx"
import Footer from "../components/Footer/Footer.tsx"

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
