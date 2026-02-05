import { useState, useEffect } from 'react';
import './Home.css';
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

const formatThaiDate = (value: any) => {
  if (!value) return "";

  // กรณีเป็น Date object จาก Google
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

  // กรณีเป็น string ปกติ
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

  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide((currentIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/1YVCkhxkn-UHy4UC8FGUV-_yK8o8vvdwqvSScw1iKdKo/gviz/tq?tqx=out:json"
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
      });
  }, []);

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

  return (
    <div className="main-content">
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
        <h3 className="section-title">ประกาศจากบริษัท</h3>

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
        <h3>
          third
        </h3>
      </div>

      <div className="container-forth">
        <h3>
          forth
        </h3>
      </div>
    </div>
  );
};

export default HomePage;
