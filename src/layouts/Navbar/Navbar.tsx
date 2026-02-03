import styles from "./Navbar.module.css"
import logo from "../../assets/logo/Hotelplus-logo.jpg"
import UserMenu from "../../components/Usermenu/UserMenu"

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <img src={logo} alt="Hotel Plus" />
      </div>

      <nav className={styles.menu}>
        <a>KOL</a>
        <a>Menu 2</a>
        <a>Menu 3</a>
        <a>Menu 4</a>
        <a>Menu 5</a>
        <a>Menu 6</a>
        <a>Menu 7</a>
        
      </nav>

      <div className={styles.right}>
        <UserMenu />
      </div>
    </header>
  )
}
