import Footer from "../../layouts/Footer/Footer"
import Navbar from "../../layouts/Navbar/Navbar"
import './Forbidden.css'


const Forbidden = () => {
  return (
    <div>
        <Navbar></Navbar>
        <div className="container-403">
            <div className="box-403">
                <h1>403 ไม่มีสิทธิ์เข้า</h1>
                
            </div>
           
        </div>
        <Footer></Footer>
    </div>
  )
}

export default Forbidden