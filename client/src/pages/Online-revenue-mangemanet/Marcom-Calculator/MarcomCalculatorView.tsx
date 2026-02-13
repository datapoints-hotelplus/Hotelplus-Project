import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Plus, Minus, AlertCircle, TrendingUp, Target, DollarSign, Activity } from 'lucide-react';

// Types
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

    // Priority 1: Goal-based recommendations
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

    // Priority 2: Budget-based recommendations
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

    // Priority 3: Performance-based recommendations
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
    if (selectedPackages.liteGmbIbe) total += 0;
    
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

  if (!showResults) {
    const currentQ = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Marcom Package Calculator
            </h1>
            <p className="text-gray-600">คำนวณและแนะนำแพ็คเกจที่เหมาะกับโรงแรมของคุณ</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                คำถามข้อที่ {currentStep + 1} / {questions.length}
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                {currentQ.category}
              </span>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentQ.type === 'multiple'
                  ? (answers[currentQ.key] as string[] || []).includes(option)
                  : answers[currentQ.key] === option;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ.key, option, currentQ.type === 'multiple')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{option}</span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              ย้อนกลับ
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                !isStepComplete()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              }`}
            >
              {currentStep === questions.length - 1 ? 'ดูผลลัพธ์' : 'ถัดไป'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const platforms = answers.q4 || [];
  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            ผลการวิเคราะห์และแนะนำแพ็คเกจ
          </h1>
          <p className="text-gray-600">สรุปข้อมูลและแพ็คเกจที่เหมาะสมสำหรับคุณ</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">สถานะปัจจุบัน</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Platform</p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-600 mb-2">ผลลัพธ์</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Followers:</span> {answers.q5}</p>
                  <p><span className="font-medium">Engagement:</span> {answers.q6}</p>
                  <p><span className="font-medium">Inbox/จอง:</span> {answers.q7}</p>
                  <p><span className="font-medium">Ads:</span> {answers.q8}</p>
                  <p><span className="font-medium">ระบบจอง:</span> {answers.q9}</p>
                  <p><span className="font-medium">KOL:</span> {answers.q10} {answers.q11 && `(${answers.q11})`}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Pain Points</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(answers.q1 || []).map((p, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">เป้าหมาย</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(answers.q2 || []).map((g, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">งบประมาณ</h3>
              </div>
              <p className="text-lg font-medium text-purple-700">{answers.q3}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">แพ็คเกจที่แนะนำ</h3>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {rec.priority}
                  </span>
                  <div>
                    <p className="text-white font-medium mb-1">{rec.reason}</p>
                    <p className="text-white/80 text-sm">แนะนำ: {rec.packages.length} แพ็คเกจ</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">เลือกแพ็คเกจบริการ</h3>

          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
              บริการแบบ One-time Service
            </h4>
            <div className="space-y-3">
              <PackageCheckbox
                label="Register Google My Business"
                price="1,500"
                checked={selectedPackages.gmb}
                onChange={() => togglePackage('gmb')}
              />
              <PackageCheckbox
                label="Register Meta"
                price="1,500"
                checked={selectedPackages.meta}
                onChange={() => togglePackage('meta')}
              />
              <PackageCheckbox
                label="Register TikTok"
                price="1,500"
                checked={selectedPackages.tiktok}
                onChange={() => togglePackage('tiktok')}
              />
              {shouldShowSocialPlus() && (
                <PackageCheckbox
                  label="Social Plus"
                  price="3,500"
                  checked={selectedPackages.socialPlus}
                  onChange={() => togglePackage('socialPlus')}
                  badge="แนะนำ"
                />
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b">
              <h4 className="text-lg font-semibold text-gray-700">บริการแบบ Lite</h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">สัญญาระยะสั้น</span>
            </div>
            <div className="space-y-3">
              <PackageCheckbox
                label="Social Plus + Meta 4 Content (Single Post / Album ต่อเดือน)"
                price="4,000"
                checked={selectedPackages.liteMetaContent}
                onChange={() => togglePackage('liteMetaContent')}
              />
              <PackageCheckbox
                label="บริการ KOL (nano) 1 ท่าน: 1 Slide show + 1 VDO / 2 posts"
                price="4,000"
                note="ไม่รวมค่าเดินทาง+ที่พัก"
                checked={selectedPackages.liteKol}
                onChange={() => togglePackage('liteKol')}
              />
              <PackageCheckbox
                label="บริการ Ad Management (ไม่จำกัดแคมเปญ)"
                price="3,000"
                note="ยังไม่รวมงบ Ads"
                checked={selectedPackages.liteAdManagement}
                onChange={() => togglePackage('liteAdManagement')}
              />
              <PackageCheckbox
                label="Google My Business + IBE"
                price="TBD"
                checked={selectedPackages.liteGmbIbe}
                onChange={() => togglePackage('liteGmbIbe')}
                disabled={true}
                note="รอค่าระบบจาก PS"
              />
            </div>

            <div className="mt-6 ml-6 pl-6 border-l-2 border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-3">Add-ons (บริการเสริม)</p>
              <div className="space-y-3">
                <AddOnControl
                  label="เพิ่ม Meta 4 Content"
                  price="2,000"
                  value={selectedPackages.liteMetaContentAddOn}
                  max={3}
                  onIncrease={() => adjustAddOn('liteMetaContentAddOn', 1)}
                  onDecrease={() => adjustAddOn('liteMetaContentAddOn', -1)}
                  disabled={!canEnableLiteMetaAddOn()}
                  note={!canEnableLiteMetaAddOn() ? "*โปรดเลือกสัญญาหลักก่อน" : "สูงสุด 3 ครั้ง"}
                />
                <AddOnControl
                  label="บริการเพิ่ม KOL (nano) 1 ท่าน"
                  price="2,000"
                  value={selectedPackages.liteKolAddOn}
                  onIncrease={() => adjustAddOn('liteKolAddOn', 1)}
                  onDecrease={() => adjustAddOn('liteKolAddOn', -1)}
                  disabled={!canEnableLiteKolAddOn()}
                  note={!canEnableLiteKolAddOn() ? "*โปรดเลือกสัญญาหลักก่อน" : "ไม่รวมค่าเดินทาง+ที่พัก"}
                />
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Google SEM + Ads</p>
                      <p className="text-xs text-gray-400">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4 pb-2 border-b">
              <h4 className="text-lg font-semibold text-gray-700">บริการแบบ Full Services</h4>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">สัญญาระยะยาว</span>
            </div>
            <div className="space-y-3">
              <PackageCheckbox
                label="Social Plus + Meta (10 Content / Month) + One-time KOL (nano) 1 ท่าน + Ads Budget"
                price="15,000"
                note="ไม่รวมค่าเดินทาง+ที่พักของ KOL"
                checked={selectedPackages.fullSocialPlusMetaKol}
                onChange={() => togglePackage('fullSocialPlusMetaKol')}
                badge="ยอดนิยม"
              />
              <PackageCheckbox
                label="KOL (nano) 3 ท่าน: 3 Slide + 3 VDO / 6 posts + Ads budget"
                price="15,000"
                note="ไม่รวมค่าเดินทาง+ที่พักของ KOL"
                checked={selectedPackages.fullKolNano}
                onChange={() => togglePackage('fullKolNano')}
              />
              <PackageCheckbox
                label="KOL (micro) 3 ท่าน: 3 Slide + 3 VDO / 6 posts + Ads budget"
                price="25,000"
                note="ไม่รวมค่าเดินทาง+ที่พักของ KOL"
                checked={selectedPackages.fullKolMicro}
                onChange={() => togglePackage('fullKolMicro')}
              />
              <PackageCheckbox
                label="KOL (macro) 3 ท่าน: 3 Slide + 3 VDO / 6 posts + Ads budget"
                price="35,000"
                note="ไม่รวมค่าเดินทาง+ที่พักของ KOL"
                checked={selectedPackages.fullKolMacro}
                onChange={() => togglePackage('fullKolMacro')}
                badge="Premium"
              />
            </div>

            <div className="mt-6 ml-6 pl-6 border-l-2 border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-3">Add-ons (บริการเสริม)</p>
              <AddOnControl
                label="เพิ่ม Meta 4 Content"
                price="2,000"
                value={selectedPackages.fullMetaContentAddOn}
                onIncrease={() => adjustAddOn('fullMetaContentAddOn', 1)}
                onDecrease={() => adjustAddOn('fullMetaContentAddOn', -1)}
                disabled={!canEnableFullMetaAddOn()}
                note={!canEnableFullMetaAddOn() ? "*โปรดเลือกสัญญาหลักก่อน" : ""}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">ค่าบริการรวมทั้งหมด</p>
              <p className="text-4xl font-bold text-white">
                {calculateTotal().toLocaleString()} <span className="text-2xl">บาท</span>
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg">
              ติดต่อเซลล์ทีม
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
              setAnswers({
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
              setSelectedPackages({
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
            }}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-all"
          >
            ← เริ่มใหม่อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  );
};

const PackageCheckbox: React.FC<PackageCheckboxProps> = ({ 
  label, 
  price, 
  note, 
  checked, 
  onChange, 
  disabled, 
  badge 
}) => (
  <div 
    className={`p-4 border-2 rounded-xl transition-all ${
      checked 
        ? 'border-indigo-500 bg-indigo-50' 
        : 'border-gray-200 hover:border-indigo-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={() => !disabled && onChange()}
  >
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
        checked ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
      }`}>
        {checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-800">{label}</p>
          {badge && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
        {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
      </div>
      <p className="font-bold text-indigo-600">{price} ฿</p>
    </div>
  </div>
);

const AddOnControl: React.FC<AddOnControlProps> = ({ 
  label, 
  price, 
  value, 
  max, 
  onIncrease, 
  onDecrease, 
  disabled, 
  note 
}) => (
  <div className={`p-3 bg-gray-50 rounded-lg border border-gray-200 ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{note}</p>
      </div>
      <p className="text-sm font-bold text-indigo-600 ml-2">{price} ฿</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        disabled={disabled || value === 0}
        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4 text-gray-600" />
      </button>
      <span className="text-lg font-semibold text-gray-800 min-w-[2rem] text-center">{value}</span>
      <button
        onClick={onIncrease}
        disabled={disabled || (max !== undefined && value >= max)}
        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4 text-gray-600" />
      </button>
      {max && <span className="text-xs text-gray-500 ml-2">สูงสุด {max}</span>}
    </div>
  </div>
);

export default MarcomCalculator;