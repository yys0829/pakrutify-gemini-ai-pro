
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

  // 算法：根据日期生成固定随机序列
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
    if (selectedOption) return; // 防止连点
    setSelectedOption(choice);
    
    if (choice === questions[currentIndex].answer) {
      setScore(s => s + 1);
      setTimeout(() => nextQuestion(), 800); // 答对后自动跳下一题
    } else {
      setShowAnalysis(true); // 答错显示解析
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowAnalysis(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setIsFinished(true);
      saveScore();
    }
  };

  const saveScore = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 这里的逻辑是简单的 upsert，实际建议根据你的积分表结构调整
      await supabase.from('user_scores').upsert({ 
        user_id: user.id, 
        last_quiz_score: score,
        last_quiz_date: new Date().toISOString()
      });
    }
  };

  if (loading) return <div className="p-20 text-center">正在加载今日题目...</div>;
  if (!questions.length) return <div className="p-20 text-center">题库暂无数据</div>;

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      {!isFinished ? (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 mt-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">第 {currentIndex + 1} / 5 题</span>
            <span className="text-xs text-gray-400">正确率: {Math.round((score/(currentIndex+1))*100)}%</span>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-8 leading-relaxed">{q.question}</h2>

          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((char) => {
              const optionKey = `option_${char.toLowerCase()}`;
              const optionText = q[optionKey];
              if (!optionText) return null;

              let btnStyle = "w-full text-left p-4 rounded-2xl border transition-all ";
              if (selectedOption === char) {
                btnStyle += char === q.answer ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500";
              } else {
                btnStyle += "bg-gray-50 border-gray-100 active:border-blue-400";
              }

              return (
                <button key={char} onClick={() => handleAnswer(char)} className={btnStyle}>
                  <span className="font-bold mr-2">{char}.</span> {optionText}
                </button>
              );
            })}
          </div>

          {showAnalysis && (
            <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 animate-pulse-once">
              <p className="text-orange-700 font-bold text-sm mb-2 text-center">回答错误</p>
              <p className="text-gray-600 text-xs leading-relaxed"><span className="font-bold text-green-600">正确答案是 {q.answer}：</span>{q.analysis}</p>
              <button onClick={nextQuestion} className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-bold">查看下一题</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-20">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold">挑战结束!</h2>
          <p className="text-gray-500 mt-2">今日答对: <span className="text-blue-600 font-black text-xl">{score}</span> 题</p>
          <button onClick={() => window.location.href='/mine'} className="mt-10 bg-blue-600 text-white px-10 py-3 rounded-full font-bold shadow-lg">领取积分</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
