
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const Quiz = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const getDailyQuestions = useCallback((allQuestions: any[]) => {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return [...allQuestions].sort(() => seededRandom() - 0.5).slice(0, 5);
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const { data } = await supabase.from('safety_quiz_pro').select('*');
      if (data && data.length > 0) {
        setQuestions(getDailyQuestions(data));
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [getDailyQuestions]);

  const handleAnswer = (choice: string) => {
    if (selectedOption) return;
    setSelectedOption(choice);
    if (choice === questions[currentIndex].answer) {
      setScore(s => s + 1);
      setTimeout(() => nextQuestion(), 800);
    } else {
      setShowAnalysis(true);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowAnalysis(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-500">加载中...</div>;

  const q = questions[currentIndex];

  return (
    // 修改点：justify-start 配合较小的 pt-2，让整体靠上
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start pt-2 pb-10 px-4">
      
      {!isFinished ? (
        // 修改点：mt-2 让卡片距离顶部更近
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col mt-2">
          
          {/* 进度条保持简洁 */}
          <div className="w-full h-1 bg-gray-100">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}
            ></div>
          </div>

          <div className="p-5">
            {/* 紧凑的页眉 */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                第 {currentIndex + 1} 题
              </span>
              <span className="text-[10px] text-slate-400 font-bold">得分: {score}</span>
            </div>

            {/* 修改点：标题间距 mb-4 缩小 */}
            <h2 className="text-base font-bold text-slate-800 mb-4 leading-snug">
              {q.question}
            </h2>

            {/* 修改点：选项间距 space-y-2 更紧凑 */}
            <div className="space-y-2 mb-2">
              {['A', 'B', 'C', 'D'].map((char) => {
                const optText = q[`option_${char.toLowerCase()}`];
                if (!optText) return null;

                let btnStyle = "w-full text-left p-3 rounded-xl border-2 transition-all flex items-center ";
                if (selectedOption === char) {
                  btnStyle += char === q.answer ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500";
                } else {
                  btnStyle += "bg-white border-slate-100 active:border-blue-200";
                }

                return (
                  <button key={char} onClick={() => handleAnswer(char)} className={btnStyle}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-[10px] font-bold ${selectedOption === char ? 'bg-white' : 'bg-slate-50 border'}`}>
                      {char}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* 修改点：解析框高度自适应，内部紧凑 */}
            {showAnalysis && (
              <div className="mt-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-xs leading-relaxed text-slate-600 mb-3">
                  <span className="font-bold text-rose-600">回答错误。</span>
                  <span className="font-bold text-green-700">正确答案：{q.answer}</span>
                  <br />
                  <span className="mt-1 block text-[11px] italic">{q.analysis}</span>
                </p>
                
                <button 
                  onClick={nextQuestion} 
                  className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-transform"
                >
                  我知道了，下一题
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 结束界面也同步紧凑化
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center mt-10">
          <div className="text-4xl mb-2">🎯</div>
          <h2 className="text-xl font-bold text-slate-800">今日挑战完成</h2>
          <div className="my-4 p-4 bg-blue-50 rounded-2xl">
            <p className="text-4xl font-black text-blue-600">{score}</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1">SUCCESSFULLY PASSED</p>
          </div>
          <button 
            onClick={() => window.location.href='/mine'} 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md"
          >
            返回个人中心
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
