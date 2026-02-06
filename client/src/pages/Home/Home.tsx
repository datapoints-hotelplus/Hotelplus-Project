import { useState, useEffect } from 'react';
import './Home.css';
import { supabase } from "../../lib/supabase";
import img1 from '../../assets/Images/Hotelplus-home.jpg';
import img2 from '../../assets/Images/Hotelplus-home1.jpg';
import img3 from '../../assets/Images/Hotelplus-home2.jpg';
import img4 from '../../assets/Images/Hotelplus-home3.jpg';
import img5 from '../../assets/Images/Hotelplus-home4.jpg';
import img6 from '../../assets/Images/Hotelplus-home5.jpg';

type Slide = {
  id: number;
  image: string;
  alt: string;
};

type Announcement = {
  title: string;
  description: string;
  date: string;
};

type Activity = {
  id: string;
  email: string;
  action: string;
  created_at: string;
};

const formatThaiDate = (value: any) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("Date")) {
    const parts = value.match(/\d+/g);
    if (!parts) return "";

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  const date = new Date(value);
  return date.toLocaleDateString("th-TH");
};


const HomePage: React.FC = () => {
  const slides: Slide[] = [
    { id: 1, image: img1, alt: 'Slide 1' },
    { id: 2, image: img2, alt: 'Slide 2' },
    { id: 3, image: img3, alt: 'Slide 3' },
    { id: 4, image: img4, alt: 'Slide 4' },
    { id: 5, image: img5, alt: 'Slide 5' },
    { id: 6, image: img6, alt: 'Slide 6' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketTeam, setTicketTeam] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide((currentIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
    )
      .then(res => res.text())
      .then(text => {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        const data = rows.map((row: any) => ({
          title: row.c[0]?.v || "",
          description: row.c[1]?.v || "",
          date: formatThaiDate(row.c[2]?.v)
        }));

        setAnnouncements(data);

        // 👉 เปิด popup ตัวแรก
        if (data.length > 0) {
          setPopupIndex(0);
        }
      });
  }, []);

  const handleClosePopup = () => {
    if (popupIndex === null) return;

    if (popupIndex < announcements.length - 1) {
      setPopupIndex(popupIndex + 1); // ไปอันถัดไป
    } else {
      setPopupIndex(null); // หมดแล้ว
    }
  };


  const changeSlide = (index: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 300);
  };

  const prevSlide = () => {
    const index =
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    changeSlide(index);
  };

  const nextSlide = () => {
    const index =
      currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    changeSlide(index);
  };

  const TICKET_API = import.meta.env.VITE_TICKET_API;
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(TICKET_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: ticketName,
          email: ticketEmail,
          team: ticketTeam,
          message: ticketMessage
        })
      });

      setTicketStatus("ส่ง Ticket เรียบร้อยแล้ว ✅");

      setTicketName("");
      setTicketEmail("");
      setTicketTeam("");
      setTicketMessage("");

    } catch (err) {
      setTicketStatus("ส่งไม่สำเร็จ ❌");
    }
  };
  


  const [activities, setActivities] = useState<Activity[]>([]);
  const timeAgo = (date: string) => {
    const diff =
      (Date.now() - new Date(date).getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
  useEffect(() => {
    const fetchLogins = async () => {
      const { data, error } = await supabase
        .from("login_activity")
        .select("id, email, action, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) {
        setActivities(data);
      }
    };
    fetchLogins();
    const interval = setInterval(fetchLogins, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-content">
      {popupIndex !== null && announcements[popupIndex] && (
          <div className="announcement-popup-overlay" onClick={handleClosePopup}>
            <div className="announcement-popup" onClick={handleClosePopup}>
              <h3>📢 Announcement 📢</h3>
              <h4>{announcements[popupIndex].title}</h4>
              <p>{announcements[popupIndex].description}</p>
              <div className="popup-footer">
                <span>{announcements[popupIndex].date}</span>
                <button onClick={handleClosePopup}>
                  ปิดประกาศ
                </button>
              </div>
            </div>
          </div>
        )}
      <div className="content-wrapper">
        <div className="img-home-box">
          <img
            src={slides[currentIndex].image}
            alt={slides[currentIndex].alt}
            className={`slide-image ${fade ? 'fade-in' : 'fade-out'}`}
          />
          <button className="button left" onClick={prevSlide}>❮</button>
          <button className="button right" onClick={nextSlide}>❯</button>
          <div className="indicators">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => changeSlide(index)}
              />
            ))}
          </div>
        </div>
        <div className="text-box">
          <h3>“HOTEL PLUS”</h3>
          <p>
            คือ ผู้ช่วยบริหารโรงแรมมืออาชีพสำหรับเจ้าของโรงแรม
            ตั้งแต่การวางแผนโครงการการลงทุนธุรกิจโรงแรม
            การบริหารยอดจองห้องพัก
            การสร้างแบรนด์โรงแรมให้เป็นที่รู้จัก
            ทำการตลาดและการประชาสัมพันธ์
            ทำให้การดำเนินงานคล่องตัว
            เพิ่มประสิทธิภาพรายได้ให้โรงแรมอย่างสูงสุด
          </p>
          <a
            href="https://www.hotelplus.asia/"
            target="_blank"
            rel="noopener noreferrer"
            className="website-btn"
          >
            เข้าสู่เว็บไซต์หลัก
          </a>
        </div>
      </div>

      <div className="container-second">
        <h3 className="section-title">📢 Announcement 📢</h3>

        <div className="announcement-list">
          {announcements.length === 0 ? (
            <p>กำลังโหลดประกาศ...</p>
          ) : (
            announcements.map((item, index) => (
              <div key={index} className="announcement-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <span>{item.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="container-third">
        <div className="activity-header">
          <h3>Employee Activity</h3>
          <span>Recent Logins</span>
        </div>
        <div className="activity-feed">
          {activities.map(item => (
            <div key={item.id} className={`activity-item ${item.action}`}>
              <span className="dot"></span>
              <p>
                <strong>{item.email}</strong>{" "}
                {item.action === "login" && "logged in"}
                {item.action === "logout" && "logged out"}
              </p>
              <small>{timeAgo(item.created_at)}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="container-foth">
        <div className="ticket-wrapper">
          <div className="ticket-text">
            <h3>แจ้งปัญหาด้านการใช้งาน / ส่งผ่าน Ticket</h3>
            <p>
              หากพบปัญหาในการใช้งานระบบ สามารถกรอกข้อมูลด้านล่างเพื่อแจ้งปัญหา  
              ทางทีมจะรีบตรวจสอบและติดต่อกลับโดยเร็วที่สุดค่ะ
            </p>
          </div>
          <form className="ticket-form" onSubmit={handleSubmitTicket}>
            <input
              type="text"
              placeholder="ชื่อผู้ติดต่อ"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="อีเมล"
              value={ticketEmail}
              onChange={(e) => setTicketEmail(e.target.value)}
              required
            />
            <select
              value={ticketTeam}
              onChange={(e) => setTicketTeam(e.target.value)}
            >
              <option value="">TEAM</option>
              <option value="The-Office">The Office</option>
              <option value="Business-Development">Business Development</option>
              <option value="Partner-Success-PS)">Partner Success (PS)</option>
              <option value="Customer-success-CS">Customer success (CS)</option>
              <option value="Online-Revenue-Management-ORM">Online Revenue Management (ORM)</option>
              <option value="Marketing-Communication-MarCom">Marketing Communication (MarCom)</option>
            </select>

            <textarea
              placeholder="รายละเอียดปัญหา"
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              required
            />

            <button type="submit">
              ส่ง Ticket
            </button>

            {ticketStatus && (
              <p className="ticket-status">{ticketStatus}</p>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
