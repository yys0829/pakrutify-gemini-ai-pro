
import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  type: string;
  topic: string;
  title: string;
  options: { id: string; text: string }[];
  answer: string;
}

interface QuizProps {
  onBack: () => void;
}

const DAILY_QUESTIONS: Question[] = [
  {
    id: 1,
    type: '单选题',
    topic: '金属非金属地下矿山安全',
    title: '地下矿山作业人员进入作业地点前，必须先进行的一项重要工作是？',
    options: [
      { id: 'A', text: '开启照明设备' },
      { id: 'B', text: '敲帮问顶，检查顶板和两帮安全情况' },
      { id: 'C', text: '清理作业现场卫生' },
      { id: 'D', text: '检查个人防护用品' }
    ],
    answer: 'B'
  },
  {
    id: 2,
    type: '单选题',
    topic: '消防安全',
    title: '手提式干粉灭火器使用时，压力表指针在哪个区域表示压力正常？',
    options: [
      { id: 'A', text: '红色区域' },
      { id: 'B', text: '黄色区域' },
      { id: 'C', text: '绿色区域' },
      { id: 'D', text: '无色区域' }
    ],
    answer: 'C'
  },
  {
    id: 3,
    type: '单选题',
    topic: '地下矿山安全',
    title: '地下矿山井下发生火灾时，人员应如何逃生？',
    options: [
      { id: 'A', text: '顺着风流方向撤退' },
      { id: 'B', text: '原地等待救援' },
      { id: 'C', text: '逆着风流方向撤退，并佩戴自救器' },
      { id: 'D', text: '躲进无风的小巷道' }
    ],
    answer: 'C'
  },
  {
    id: 4,
    type: '单选题',
    topic: '消防安全',
    title: '下列哪种灭火器不适用于扑灭带电设备火灾？',
    options: [
      { id: 'A', text: '二氧化碳灭火器' },
      { id: 'B', text: '泡沫灭火器' },
      { id: 'C', text: '干粉灭火器' },
      { id: 'D', text: '1211灭火器' }
    ],
    answer: 'B'
  },
  {
    id: 5,
    type: '单选题',
    topic: '公共安全',
    title: '在公共场所遇到踩踏风险时，如果摔倒无法站起，应采取什么姿势保护自己？',
    options: [
      { id: 'A', text: '俯卧在地，双手抱头' },
      { id: 'B', text: '仰卧在地，双脚乱蹬' },
      { id: 'C', text: '身体蜷缩成球状，双手扣紧在颈后，侧卧' },
      { id: 'D', text: '大声呼救并试图抓住他人的腿' }
    ],
    answer: 'C'
  }
];

const Quiz: React.FC<QuizProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = DAILY_QUESTIONS[currentStep];

  const handleOptionClick = (optionId: string) => {
    if (selectedAnswer !== null || isAnimating) return;
    
    setSelectedAnswer(optionId);
    if (optionId === currentQuestion.answer) {
      setScore(s => s + 1);
    }

    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep < DAILY_QUESTIONS.length - 1) {
        setCurrentStep(s => s + 1);
        setSelectedAnswer(null);
        setIsAnimating(false);
      } else {
        setShowResult(true);
        setIsAnimating(false);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="size-24 bg-warning/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <span className="material-symbols-outlined text-warning text-5xl">military_tech</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">答题圆满结束！</h2>
          <p className="text-gray-500 text-sm mb-8">坚持学习是安全生产的基础</p>
          
          <div className="bg-background-light w-full rounded-3xl p-6 border border-gray-100 mb-8">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">正确题数</p>
                <p className="text-3xl font-black text-primary">{score} <span className="text-sm font-normal text-gray-400">/ 5</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">获得积分</p>
                <p className="text-3xl font-black text-success">+{score} <span className="text-sm font-normal text-gray-400">pts</span></p>
              </div>
            </div>
          </div>

          <button 
            onClick={onBack}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            返回首页
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-light overflow-hidden">
      <header className="bg-white border-b border-gray-100 shrink-0 sticky top-0 z-50">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="text-primary flex size-10 items-center justify-center shrink-0">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center pr-10">安全知识每日答题</h1>
        </div>
        
        {/* 进度条 */}
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-400">当前进度</span>
            <span className="text-[10px] font-bold text-primary">{currentStep + 1} / {DAILY_QUESTIONS.length}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${((currentStep + 1) / DAILY_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-widest uppercase">
                {currentQuestion.type}
              </div>
              <span className="text-[10px] text-gray-400 font-bold italic">#{currentQuestion.topic}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 leading-relaxed">
              {currentQuestion.title}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const isCorrect = opt.id === currentQuestion.answer;
              
              let btnClass = "border-gray-100 bg-gray-50 text-gray-700";
              if (selectedAnswer !== null) {
                if (isCorrect) {
                  btnClass = "border-success bg-success/5 text-success";
                } else if (isSelected) {
                  btnClass = "border-danger bg-danger/5 text-danger";
                } else {
                  btnClass = "opacity-50 border-gray-100 bg-gray-50 text-gray-400";
                }
              }

              return (
                <button 
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 transform ${isSelected ? 'scale-[0.98]' : 'active:scale-[0.98]'} ${btnClass}`}
                >
                  <div className={`size-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    selectedAnswer !== null && isCorrect ? 'border-success text-success bg-success/10' :
                    selectedAnswer !== null && isSelected && !isCorrect ? 'border-danger text-danger bg-danger/10' :
                    'border-gray-200 text-gray-400'
                  }`}>
                    {selectedAnswer !== null && isCorrect ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : selectedAnswer !== null && isSelected && !isCorrect ? (
                      <span className="material-symbols-outlined text-sm">close</span>
                    ) : (
                      opt.id
                    )}
                  </div>
                  <span className="text-sm font-medium leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedAnswer !== null && (
          <div className={`mt-6 p-4 rounded-2xl animate-in zoom-in-95 duration-300 flex items-center gap-3 ${
            selectedAnswer === currentQuestion.answer ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            <span className="material-symbols-outlined">
              {selectedAnswer === currentQuestion.answer ? 'sentiment_very_satisfied' : 'sentiment_dissatisfied'}
            </span>
            <span className="text-xs font-bold">
              {selectedAnswer === currentQuestion.answer ? '回答正确！积分 +1' : `回答错误，正确答案是 ${currentQuestion.answer}`}
            </span>
          </div>
        )}

        <div className="mt-8 bg-warning/5 rounded-2xl p-4 border border-warning/10 flex items-start gap-3">
          <span className="material-symbols-outlined text-warning text-sm">info</span>
          <div>
            <p className="text-[10px] font-bold text-warning uppercase tracking-widest">积分规则</p>
            <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
              每答对一题可获得 <span className="font-bold text-primary">1 分安全积分</span>。所有题目均来自公司最新版安全生产标准化手册。
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-6 bg-white/80 backdrop-blur-md border-t border-gray-50 flex items-center justify-between z-50">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">当前答对</span>
          <span className="text-xl font-black text-primary">{score} <span className="text-xs">pts</span></span>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl active:bg-gray-200 transition-colors"
        >
          暂时退出
        </button>
      </footer>
    </div>
  );
};

export default Quiz;
