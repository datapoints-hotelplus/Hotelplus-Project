import './Footer.css';


export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-section brand">
          <img src="/logo/logo.png" alt="Hotelplus" className="footer-logo" />

          <p>
            ผู้ช่วยมืออาชีพสำหรับเจ้าของโรงแรมในการดำเนินงานในด้านการขาย
            เพื่อยอดจองห้องพักออนไลน์ วางแผนการขายห้องพัก 
            ทำการตลาดและประชาสัมพันธ์
          </p>
        </div>

        <div className="footer-section position">
          <h4>Our Team</h4>
          <ul className="position-list">
            <li>The Office</li>
            <li>Business Development</li>
            <li>Partner Success (PS)</li>
            <li>Customer success (CS)</li>
            <li>Online Revenue Management (ORM)</li>
            <li>Marketing Communication (MarCom)</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-section">
          <h4>Contract</h4>
          <p>Email: info@hotelplus.asia</p>
          <p>Tel: (+66)82 898 9369</p>
          <p>Add: 92/5 2nd floor, Sathorn Thani 2 Building</p>
        </div>

      </div>

      <div className="footer-bottom">
        Copyright © 2023 by Hotelplus.asia All Right Reserved.
      </div>
    </footer>
  );
}
