import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Plus, Minus, AlertCircle, TrendingUp, Target, DollarSign, Activity } from 'lucide-react';
import styles from './MarcomCalculatorView.module.css';


interface Answers {
  q1: string[];
  q2: string[];
  q3: string;
  q4: string[];
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
}

interface SelectedPackages {
  gmb: boolean;
  meta: boolean;
  tiktok: boolean;
  socialPlus: boolean;
  liteMetaContent: boolean;
  liteKol: boolean;
  liteAdManagement: boolean;
  liteGmbIbe: boolean;
  liteMetaContentAddOn: number;
  liteKolAddOn: number;
  fullSocialPlusMetaKol: boolean;
  fullKolNano: boolean;
  fullKolMicro: boolean;
  fullKolMacro: boolean;
  fullMetaContentAddOn: number;
}

interface Question {
  category: string;
  question: string;
  key: keyof Answers;
  type: 'single' | 'multiple';
  options: string[];
}

interface Recommendation {
  priority: number;
  reason: string;
  packages: string[];
}

interface PackageCheckboxProps {
  label: string;
  price: string;
  note?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  badge?: string;
}

interface AddOnControlProps {
  label: string;
  price: string;
  value: number;
  max?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled: boolean;
  note: string;
}

const MarcomCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  const [answers, setAnswers] = useState<Answers>({
    q1: [],
    q2: [],
    q3: '',
    q4: [],
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: '',
    q10: '',
    q11: ''
  });

  const [selectedPackages, setSelectedPackages] = useState<SelectedPackages>({
    gmb: false,
    meta: false,
    tiktok: false,
    socialPlus: false,
    liteMetaContent: false,
    liteKol: false,
    liteAdManagement: false,
    liteGmbIbe: false,
    liteMetaContentAddOn: 0,
    liteKolAddOn: 0,
    fullSocialPlusMetaKol: false,
    fullKolNano: false,
    fullKolMicro: false,
    fullKolMacro: false,
    fullMetaContentAddOn: 0
  });

  const questions: Question[] = [
    {
      category: "Pain Points & Goals",
      question: "ปัญหาหลัก ๆ ที่เจอตอนนี้คืออะไร?",
      key: "q1",
      type: "multiple",
      options: [
        "ไม่มีเวลาจัดการ Social Media",
        "โพสต์แล้วไม่มีคน engage / ไม่มีคนสนใจ",
        "ยิง Ads แล้วไม่คุ้ม",
        "บุคกิ้ง OTA เยอะ เสียค่าคอมมิชชั่นสูง",
        "ไม่รู้จะทำ content อะไรดี",
        "แข่งกับโรงแรมอื่นไม่ไหว",
        "ไม่มีปัญหาอะไร / อยากพัฒนาต่อยอด"
      ]
    },
    {
      category: "Pain Points & Goals",
      question: "เป้าหมายที่อยากบรรลุคืออะไร?",
      key: "q2",
      type: "multiple",
      options: [
        "เพิ่มคนรู้จักโรงแรม",
        "มีคนติดต่อสอบถาม/จองมากขึ้น",
        "ลด commission ที่จ่ายให้ OTA",
        "เพิ่มยอดจองโดยรวม",
        "สร้างภาพลักษณ์ที่ดีขึ้น"
      ]
    },
    {
      category: "Pain Points & Goals",
      question: "มีงบสำหรับ Marketing Communication เดือนละเท่าไหร่?",
      key: "q3",
      type: "single",
      options: [
        "มากกว่า 50,000 บาท/เดือน",
        "30,000-50,000 บาท/เดือน",
        "15,000-30,000 บาท/เดือน",
        "น้อยกว่า 15,000 บาท/เดือน",
        "ยังไม่แน่ใจ / อยากให้แนะนำมาก่อน"
      ]
    },
    {
      category: "Social Media Management",
      question: "Platform ไหนที่ใช้อยู่บ้าง?",
      key: "q4",
      type: "multiple",
      options: [
        "Meta/Facebook",
        "TikTok",
        "Google My Business",
        "ยังไม่มีเลย"
      ]
    },
    {
      category: "Follower & Engagement",
      question: "Follower ของโรงแรมเป็นยังไง?",
      key: "q5",
      type: "single",
      options: [
        "เยอะดี (หลักหมื่นขึ้นไป)",
        "พอใช้ได้ (หลักพัน)",
        "น้อย (หลักร้อยหรือต่ำกว่า)",
        "ยังไม่มี / เพิ่งเริ่มทำ"
      ]
    },
    {
      category: "Follower & Engagement",
      question: "โพสต์อะไรขึ้นไป มีคนมา like, comment, share เยอะไหม?",
      key: "q6",
      type: "single",
      options: [
        "เยอะดี (มักจะมีคนตอบสนองเสมอ)",
        "พอมีบ้าง (บางโพสต์ได้ผลดี บางโพสต์ไม่ค่อย)",
        "น้อย (โพสต์แล้วมักจะเงียบ ๆ)",
        "ไม่แน่ใจ / ไม่ค่อยได้สังเกต"
      ]
    },
    {
      category: "Follower & Engagement",
      question: "มีคนทัก inbox หรือโทรมาสอบถามหรือทำจองจาก Social Media บ้างไหม?",
      key: "q7",
      type: "single",
      options: [
        "บ่อย (เกือบทุกวัน)",
        "มีบ้าง (อาทิตย์ละ 2-3 ครั้ง)",
        "นาน ๆ ที (เดือนละไม่กี่ครั้ง)",
        "แทบไม่มีเลย"
      ]
    },
    {
      category: "สถานะการทำโฆษณา",
      question: "ตอนนี้ยิง Ads อยู่ไหม?",
      key: "q8",
      type: "single",
      options: [
        "ยิงสม่ำเสมอ",
        "เคยยิง แต่หยุดไปแล้ว",
        "ไม่เคยยิงเลย"
      ]
    },
    {
      category: "สถานะระบบจองห้องพัก",
      question: "มีระบบจองตรงบนเว็บไซต์หรือยัง?",
      key: "q9",
      type: "single",
      options: [
        "มี และใช้งานได้ดี",
        "มี แต่ใช้งานยาก / ไม่ค่อยมีคนใช้",
        "ไม่มี"
      ]
    },
    {
      category: "KOL & Influencer Marketing",
      question: "เคยใช้ KOL/Influencer มาช่วยรีวิวหรือโปรโมทไหม?",
      key: "q10",
      type: "single",
      options: [
        "ใช้บ่อย",
        "เคยใช้บ้าง (ปีละ 1-2 ครั้ง)",
        "ไม่เคยใช้เลย"
      ]
    },
    {
      category: "KOL & Influencer Marketing",
      question: "ถ้าเคยใช้ มีผลตอบรับดีไหม?",
      key: "q11",
      type: "single",
      options: [
        "ดีมาก (มีคนติดต่อมาจองเยอะ)",
        "พอใช้ได้",
        "ไม่ค่อยดี / ไม่แน่ใจ"
      ]
    }
  ];

  const handleAnswer = (key: keyof Answers, value: string, isMultiple: boolean): void => {
    if (isMultiple) {
      const current = (answers[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [key]: updated as any });
    } else {
      setAnswers({ ...answers, [key]: value as any });
    }
  };

  const isStepComplete = (): boolean => {
    const currentQ = questions[currentStep];
    if (currentQ.type === 'multiple') {
      return answers[currentQ.key] && (answers[currentQ.key] as string[]).length > 0;
    }
    return answers[currentQ.key] !== '';
  };

  const nextStep = (): void => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const budget = answers.q3;
    const painPoints = answers.q1 || [];
    const goals = answers.q2 || [];
    const platforms = answers.q4 || [];

    if (goals.includes("เพิ่มคนรู้จักโรงแรม") || painPoints.includes("แข่งกับโรงแรมอื่นไม่ไหว")) {
      recommendations.push({
        priority: 1,
        reason: "เหมาะกับเป้าหมายเพิ่มการรับรู้แบรนด์",
        packages: ["fullSocialPlusMetaKol", "fullKolNano"]
      });
    }

    if (goals.includes("มีคนติดต่อสอบถาม/จองมากขึ้น") || painPoints.includes("โพสต์แล้วไม่มีคน engage / ไม่มีคนสนใจ")) {
      recommendations.push({
        priority: 1,
        reason: "เหมาะกับเป้าหมายเพิ่ม Engagement และ Conversion",
        packages: ["liteMetaContent", "liteKol", "liteAdManagement"]
      });
    }

    if (goals.includes("ลด commission ที่จ่ายให้ OTA") || painPoints.includes("บุคกิ้ง OTA เยอะ เสียค่าคอมมิชชั่นสูง")) {
      recommendations.push({
        priority: 1,
        reason: "ช่วยเพิ่มการจองตรง ลด OTA dependency",
        packages: ["liteGmbIbe", "liteAdManagement"]
      });
    }

    if (budget === "มากกว่า 50,000 บาท/เดือน") {
      recommendations.push({
        priority: 2,
        reason: "งบประมาณเหมาะกับแพ็คเกจ Full Services",
        packages: ["fullSocialPlusMetaKol", "fullKolMicro", "fullKolMacro"]
      });
    } else if (budget === "30,000-50,000 บาท/เดือน") {
      recommendations.push({
        priority: 2,
        reason: "งบประมาณเหมาะกับแพ็คเกจ Full Services และ Lite ผสม",
        packages: ["fullSocialPlusMetaKol", "fullKolNano", "liteMetaContent", "liteKol"]
      });
    } else if (budget === "15,000-30,000 บาท/เดือน") {
      recommendations.push({
        priority: 2,
        reason: "งบประมาณเหมาะกับแพ็คเกจ Lite",
        packages: ["liteMetaContent", "liteKol", "liteAdManagement"]
      });
    }

    if (platforms.includes("ยังไม่มีเลย")) {
      recommendations.push({
        priority: 3,
        reason: "แนะนำเริ่มจากการสร้าง Platform พื้นฐาน",
        packages: ["gmb", "meta", "tiktok", "socialPlus"]
      });
    }

    return recommendations;
  };

  const calculateTotal = (): number => {
    let total = 0;
    
    if (selectedPackages.gmb) total += 1500;
    if (selectedPackages.meta) total += 1500;
    if (selectedPackages.tiktok) total += 1500;
    if (selectedPackages.socialPlus) total += 3500;
    
    if (selectedPackages.liteMetaContent) total += 4000;
    if (selectedPackages.liteKol) total += 4000;
    if (selectedPackages.liteAdManagement) total += 3000;
    
    total += selectedPackages.liteMetaContentAddOn * 2000;
    total += selectedPackages.liteKolAddOn * 2000;
    
    if (selectedPackages.fullSocialPlusMetaKol) total += 15000;
    if (selectedPackages.fullKolNano) total += 15000;
    if (selectedPackages.fullKolMicro) total += 25000;
    if (selectedPackages.fullKolMacro) total += 35000;
    
    total += selectedPackages.fullMetaContentAddOn * 2000;
    
    return total;
  };

  const togglePackage = (key: keyof SelectedPackages): void => {
    setSelectedPackages({ ...selectedPackages, [key]: !selectedPackages[key] });
  };

  const adjustAddOn = (key: keyof SelectedPackages, delta: number): void => {
    const current = selectedPackages[key] as number;
    const newValue = Math.max(0, current + delta);
    
    if (key === 'liteMetaContentAddOn' && newValue > 3) return;
    
    setSelectedPackages({ ...selectedPackages, [key]: newValue });
  };

  const canEnableLiteMetaAddOn = (): boolean => selectedPackages.liteMetaContent;
  const canEnableLiteKolAddOn = (): boolean => selectedPackages.liteKol;
  const canEnableFullMetaAddOn = (): boolean => selectedPackages.fullSocialPlusMetaKol;
  const shouldShowSocialPlus = (): boolean => {
    const platforms = answers.q4 || [];
    return platforms.includes("Meta/Facebook") || 
           platforms.includes("TikTok") || 
           platforms.includes("Google My Business");
  };

  const resetCalculator = () => {
    setShowResults(false);
    setCurrentStep(0);
    setAnswers({
      q1: [], q2: [], q3: '', q4: [], q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: ''
    });
    setSelectedPackages({
      gmb: false, meta: false, tiktok: false, socialPlus: false,
      liteMetaContent: false, liteKol: false, liteAdManagement: false, liteGmbIbe: false,
      liteMetaContentAddOn: 0, liteKolAddOn: 0,
      fullSocialPlusMetaKol: false, fullKolNano: false, fullKolMicro: false, fullKolMacro: false,
      fullMetaContentAddOn: 0
    });
  };

  if (!showResults) {
    const currentQ = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Marcom Package Calculator</h1>
            <p className={styles.subtitle}>คำนวณและแนะนำแพ็คเกจที่เหมาะกับโรงแรมของคุณ</p>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>
                คำถามข้อที่ {currentStep + 1} / {questions.length}
              </span>
              <span className={styles.progressPercent}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className={styles.progressBarBg}>
              <div 
                className={styles.progressBarFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.categoryBadge}>
                {currentQ.category}
              </span>
              <h2 className={styles.questionText}>
                {currentQ.question}
              </h2>
            </div>

            <div className={styles.optionsList}>
              {currentQ.options.map((option, idx) => {
                const isSelected = currentQ.type === 'multiple'
                  ? (answers[currentQ.key] as string[] || []).includes(option)
                  : answers[currentQ.key] === option;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ.key, option, currentQ.type === 'multiple')}
                    className={`${styles.optionButton} ${isSelected ? styles.optionSelected : ''}`}
                  >
                    <span className={styles.optionLabel}>{option}</span>
                    {isSelected && <Check className={styles.checkIcon} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.navigation}>
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`${styles.navButton} ${currentStep === 0 ? styles.navButtonDisabled : ''}`}
            >
              <ChevronLeft className={styles.navIcon} />
              ย้อนกลับ
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className={`${styles.navButton} ${styles.navButtonPrimary} ${!isStepComplete() ? styles.navButtonDisabled : ''}`}
            >
              {currentStep === questions.length - 1 ? 'ดูผลลัพธ์' : 'ถัดไป'}
              <ChevronRight className={styles.navIcon} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const platforms = answers.q4 || [];
  const recommendations = getRecommendations();

  return (
    <div className={styles.container}>
      <div className={styles.resultsWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>ผลการวิเคราะห์และแนะนำแพ็คเกจ</h1>
          <p className={styles.subtitle}>สรุปข้อมูลและแพ็คเกจที่เหมาะสมสำหรับคุณ</p>
        </div>

        <div className={styles.profileGrid}>
          <div className={styles.profileCard}>
            <div className={styles.profileCardHeader}>
              <Activity className={styles.profileIcon} />
              <h3 className={styles.profileCardTitle}>สถานะปัจจุบัน</h3>
            </div>
            <div className={styles.profileCardContent}>
              <div className={styles.profileSection}>
                <p className={styles.profileLabel}>Platform</p>
                <div className={styles.tagList}>
                  {platforms.map((p, idx) => (
                    <span key={idx} className={`${styles.tag} ${styles.tagBlue}`}>{p}</span>
                  ))}
                </div>
              </div>
              <div className={styles.profileDivider} />
              <div className={styles.profileSection}>
                <p className={styles.profileLabel}>ผลลัพธ์</p>
                <div className={styles.resultList}>
                  <p><span className={styles.resultKey}>Followers:</span> {answers.q5}</p>
                  <p><span className={styles.resultKey}>Engagement:</span> {answers.q6}</p>
                  <p><span className={styles.resultKey}>Inbox/จอง:</span> {answers.q7}</p>
                  <p><span className={styles.resultKey}>Ads:</span> {answers.q8}</p>
                  <p><span className={styles.resultKey}>ระบบจอง:</span> {answers.q9}</p>
                  <p><span className={styles.resultKey}>KOL:</span> {answers.q10} {answers.q11 && `(${answers.q11})`}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.profileSecondary}>
            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <AlertCircle className={styles.profileIconOrange} />
                <h3 className={styles.profileCardTitle}>Pain Points</h3>
              </div>
              <div className={styles.tagList}>
                {(answers.q1 || []).map((p, idx) => (
                  <span key={idx} className={`${styles.tag} ${styles.tagOrange}`}>{p}</span>
                ))}
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <Target className={styles.profileIconGreen} />
                <h3 className={styles.profileCardTitle}>เป้าหมาย</h3>
              </div>
              <div className={styles.tagList}>
                {(answers.q2 || []).map((g, idx) => (
                  <span key={idx} className={`${styles.tag} ${styles.tagGreen}`}>{g}</span>
                ))}
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <DollarSign className={styles.profileIconPurple} />
                <h3 className={styles.profileCardTitle}>งบประมาณ</h3>
              </div>
              <p className={styles.budgetText}>{answers.q3}</p>
            </div>
          </div>
        </div>

        <div className={styles.recommendationCard}>
          <div className={styles.recommendationHeader}>
            <TrendingUp className={styles.recommendationIcon} />
            <h3 className={styles.recommendationTitle}>แพ็คเกจที่แนะนำ</h3>
          </div>
          <div className={styles.recommendationList}>
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className={styles.recommendationItem}>
                <span className={styles.priorityBadge}>{rec.priority}</span>
                <div>
                  <p className={styles.recommendationReason}>{rec.reason}</p>
                  <p className={styles.recommendationCount}>แนะนำ: {rec.packages.length} แพ็คเกจ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PackageSelectionView
          selectedPackages={selectedPackages}
          togglePackage={togglePackage}
          adjustAddOn={adjustAddOn}
          canEnableLiteMetaAddOn={canEnableLiteMetaAddOn}
          canEnableLiteKolAddOn={canEnableLiteKolAddOn}
          canEnableFullMetaAddOn={canEnableFullMetaAddOn}
          shouldShowSocialPlus={shouldShowSocialPlus}
        />

        <div className={styles.totalCard}>
          <div>
            <p className={styles.totalLabel}>ค่าบริการรวมทั้งหมด</p>
            <p className={styles.totalAmount}>
              {calculateTotal().toLocaleString()} <span className={styles.totalCurrency}>บาท</span>
            </p>
          </div>
          <button className={styles.contactButton}>ติดต่อเซลล์ทีม</button>
        </div>

        <div className={styles.resetSection}>
          <button onClick={resetCalculator} className={styles.resetButton}>
            ← เริ่มใหม่อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const PackageSelectionView: React.FC<any> = ({
  selectedPackages, togglePackage, adjustAddOn,
  canEnableLiteMetaAddOn, canEnableLiteKolAddOn, canEnableFullMetaAddOn, shouldShowSocialPlus
}) => (
  <div className={styles.packageCard}>
    <h3 className={styles.packageCardTitle}>เลือกแพ็คเกจบริการ</h3>

    <PackageSection title="บริการแบบ One-time Service">
      <PackageCheckbox label="Register Google My Business" price="1,500" checked={selectedPackages.gmb} onChange={() => togglePackage('gmb')} />
      <PackageCheckbox label="Register Meta" price="1,500" checked={selectedPackages.meta} onChange={() => togglePackage('meta')} />
      <PackageCheckbox label="Register TikTok" price="1,500" checked={selectedPackages.tiktok} onChange={() => togglePackage('tiktok')} />
      {shouldShowSocialPlus() && <PackageCheckbox label="Social Plus" price="3,500" checked={selectedPackages.socialPlus} onChange={() => togglePackage('socialPlus')} badge="แนะนำ" />}
    </PackageSection>

    <PackageSection title="บริการแบบ Lite" badge="สัญญาระยะสั้น">
      <PackageCheckbox label="Social Plus + Meta 4 Content (Single Post / Album ต่อเดือน)" price="4,000" checked={selectedPackages.liteMetaContent} onChange={() => togglePackage('liteMetaContent')} />
      <PackageCheckbox label="บริการ KOL (nano) 1 ท่าน: 1 Slide show + 1 VDO / 2 posts" price="4,000" note="ไม่รวมค่าเดินทาง+ที่พัก" checked={selectedPackages.liteKol} onChange={() => togglePackage('liteKol')} />
      <PackageCheckbox label="บริการ Ad Management (ไม่จำกัดแคมเปญ)" price="3,000" note="ยังไม่รวมงบ Ads" checked={selectedPackages.liteAdManagement} onChange={() => togglePackage('liteAdManagement')} />
      <PackageCheckbox label="Google My Business + IBE" price="TBD" checked={selectedPackages.liteGmbIbe} onChange={() => togglePackage('liteGmbIbe')} disabled note="รอค่าระบบจาก PS" />
      
      <div className={styles.addOnSection}>
        <p className={styles.addOnLabel}>Add-ons (บริการเสริม)</p>
        <div className={styles.addOnList}>
          <AddOnControl label="เพิ่ม Meta 4 Content" price="2,000" value={selectedPackages.liteMetaContentAddOn} max={3}
            onIncrease={() => adjustAddOn('liteMetaContentAddOn', 1)} onDecrease={() => adjustAddOn('liteMetaContentAddOn', -1)}
            disabled={!canEnableLiteMetaAddOn()} note={!canEnableLiteMetaAddOn() ? "*โปรดเลือกสัญญาหลักก่อน" : "สูงสุด 3 ครั้ง"} />
          <AddOnControl label="บริการเพิ่ม KOL (nano) 1 ท่าน" price="2,000" value={selectedPackages.liteKolAddOn}
            onIncrease={() => adjustAddOn('liteKolAddOn', 1)} onDecrease={() => adjustAddOn('liteKolAddOn', -1)}
            disabled={!canEnableLiteKolAddOn()} note={!canEnableLiteKolAddOn() ? "*โปรดเลือกสัญญาหลักก่อน" : "ไม่รวมค่าเดินทาง+ที่พัก"} />
          <div className={styles.comingSoon}>
            <div>
              <p className={styles.comingSoonTitle}>Google SEM + Ads</p>
              <p className={styles.comingSoonText}>Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </PackageSection>

    <PackageSection title="บริการแบบ Full Services" badge="สัญญาระยะยาว" badgeStyle="purple">
      <PackageCheckbox label="Social Plus + Meta (10 Content / Month) + One-time KOL (nano) 1 ท่าน + Ads Budget" price="15,000" note="ไม่รวมค่าเดินทาง+ที่พักของ KOL" checked={selectedPackages.fullSocialPlusMetaKol} onChange={() => togglePackage('fullSocialPlusMetaKol')} badge="ยอดนิยม" />
      <PackageCheckbox label="KOL (nano) 3 ท่าน: 3 Slide + 3 VDO / 6 posts + Ads budget" price="15,000" note="ไม่รวมค่าเดินทาง+ที่พักของ KOL" checked={selectedPackages.fullKolNano} onChange={() => togglePackage('fullKolNano')} />
      <PackageCheckbox label="KOL (micro) 3 ท่าน: 3 Slide + 3 VDO / 6 posts + Ads budget" price="25,000" note="ไม่รวมค่าเดินทาง+ที่พักของ KOL" checked={selectedPackages.fullKolMicro} onChange={() => togglePackage('fullKolMicro')} />
      <PackageCheckbox label="KOL (macro) 3 ท่าน: 3 Slide + 3 VDO / 6 posts + Ads budget" price="35,000" note="ไม่รวมค่าเดินทาง+ที่พักของ KOL" checked={selectedPackages.fullKolMacro} onChange={() => togglePackage('fullKolMacro')} badge="Premium" />
      
      <div className={styles.addOnSection}>
        <p className={styles.addOnLabel}>Add-ons (บริการเสริม)</p>
        <AddOnControl label="เพิ่ม Meta 4 Content" price="2,000" value={selectedPackages.fullMetaContentAddOn}
          onIncrease={() => adjustAddOn('fullMetaContentAddOn', 1)} onDecrease={() => adjustAddOn('fullMetaContentAddOn', -1)}
          disabled={!canEnableFullMetaAddOn()} note={!canEnableFullMetaAddOn() ? "*โปรดเลือกสัญญาหลักก่อน" : ""} />
      </div>
    </PackageSection>
  </div>
);

const PackageSection: React.FC<{ title: string; badge?: string; badgeStyle?: string; children: React.ReactNode }> = ({ 
  title, badge, badgeStyle = 'blue', children 
}) => (
  <div className={styles.packageSection}>
    <div className={styles.packageSectionHeader}>
      <h4 className={styles.packageSectionTitle}>{title}</h4>
      {badge && <span className={`${styles.sectionBadge} ${styles[`sectionBadge${badgeStyle.charAt(0).toUpperCase() + badgeStyle.slice(1)}`]}`}>{badge}</span>}
    </div>
    <div className={styles.packageList}>
      {children}
    </div>
  </div>
);

const PackageCheckbox: React.FC<PackageCheckboxProps> = ({ label, price, note, checked, onChange, disabled, badge }) => (
  <div 
    onClick={() => !disabled && onChange()}
    className={`${styles.packageItem} ${checked ? styles.packageItemChecked : ''} ${disabled ? styles.packageItemDisabled : ''}`}
  >
    <div className={styles.packageItemContent}>
      <div className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}>
        {checked && <Check className={styles.checkboxIcon} />}
      </div>
      <div className={styles.packageItemInfo}>
        <div className={styles.packageItemHeader}>
          <p className={styles.packageItemLabel}>{label}</p>
          {badge && <span className={styles.packageBadge}>{badge}</span>}
        </div>
        {note && <p className={styles.packageItemNote}>{note}</p>}
      </div>
      <p className={styles.packageItemPrice}>{price} ฿</p>
    </div>
  </div>
);

const AddOnControl: React.FC<AddOnControlProps> = ({ label, price, value, max, onIncrease, onDecrease, disabled, note }) => (
  <div className={`${styles.addOnControl} ${disabled ? styles.addOnControlDisabled : ''}`}>
    <div className={styles.addOnControlHeader}>
      <div className={styles.addOnControlInfo}>
        <p className={styles.addOnControlLabel}>{label}</p>
        <p className={styles.addOnControlNote}>{note}</p>
      </div>
      <p className={styles.addOnControlPrice}>{price} ฿</p>
    </div>
    <div className={styles.addOnControlActions}>
      <button
        onClick={onDecrease}
        disabled={disabled || value === 0}
        className={styles.addOnButton}
      >
        <Minus className={styles.addOnButtonIcon} />
      </button>
      <span className={styles.addOnControlValue}>{value}</span>
      <button
        onClick={onIncrease}
        disabled={disabled || (max !== undefined && value >= max)}
        className={styles.addOnButton}
      >
        <Plus className={styles.addOnButtonIcon} />
      </button>
      {max && <span className={styles.addOnControlMax}>สูงสุด {max}</span>}
    </div>
  </div>
);

export default MarcomCalculator;