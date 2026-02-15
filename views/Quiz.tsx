
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const Quiz = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0); // 本次答题得分
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 1. 获取今日固定随机题目 (5道)
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

  // 2. 初始化从数据库获取题库
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

  // 3. 核心保存逻辑：更新年度积分与累计积分
  const saveScore = async (finalScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // A. 先查询该用户当前的年度积分和累计积分
      const { data: currentData } = await supabase
        .from('user_scores')
        .select('yearly_points, total_points')
        .eq('user_id', user.id)
        .single();

      // B. 如果是新用户则初始为0，否则在原基础上累加
      const oldYearly = currentData?.yearly_points || 0;
      const oldTotal = currentData?.total_points || 0;

      // C. 写入更新
      const { error } = await supabase
        .from('user_scores')
        .upsert({ 
          user_id: user.id, 
          yearly_points: oldYearly + finalScore, // 累加至年度
          total_points: oldTotal + finalScore,   // 累加至累计
          last_quiz_date: new Date().toISOString().split('T')[0] 
        }, { onConflict: 'user_id' });

      if (error) throw error;
      console.log("年度及累计积分已同步");
    } catch (err: any) {
      console.error("保存失败:", err.message);
    }
  };

  // 4. 处理答案点击
  const handleAnswer = (choice: string) => {
    if (selectedOption) return;
    setSelectedOption(choice);
    
    if (choice === questions[currentIndex].answer) {
      setScore(s => s + 1);
      setTimeout(() => nextQuestion(score + 1), 800); // 答对自动下一题
    } else {
      setShowAnalysis(true); // 答错显示解析
    }
  };

  const nextQuestion = (currentRunningScore: number) => {
    setSelectedOption(null);
    setShowAnalysis(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setIsFinished(true);
      saveScore(currentRunningScore); // 答题结束，执行保存
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-500">正在生成今日题目...</div>;
  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start pt-4 pb-10 px-4">
      {!isFinished ? (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mt-2 border border-white">
          <div className="w-full h-1 bg-blue-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}></div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Q{currentIndex + 1} / 5</span>
              <span className="text-[10px] text-slate-400 font-bold">今日得分: {score}</span>
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-5 leading-snug">{q.question}</h2>
            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D'].map((char) => {
                const optText = q[`option_${char.toLowerCase()}`];
                if (!optText) return null;
                let btnStyle = "w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center ";
                if (selectedOption === char) {
                  btnStyle += char === q.answer ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500";
                } else { btnStyle += "bg-slate-50 border-slate-50 active:border-blue-200"; }
                return (
                  <button key={char} onClick={() => handleAnswer(char)} className={btnStyle}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-[10px] font-bold ${selectedOption === char ? 'bg-white' : 'bg-white border'}`}>{char}</span>
                    <span className="text-sm font-medium text-slate-700">{optText}</span>
                  </button>
                );
              })}
            </div>
            {showAnalysis && (
              <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 border-dashed">
                <p className="text-xs leading-relaxed text-slate-600 mb-3">
                  <span className="font-bold text-rose-600">回答错误。</span>
                  <span className="font-bold text-green-700">正确答案是 {q.answer}</span>
                  <br />
                  <span className="mt-2 block text-[11px] italic text-slate-500 line-clamp-3">{q.analysis}</span>
                </p>
                <button onClick={() => nextQuestion(score)} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg">进入下一题</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center mt-10">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-xl font-black text-slate-800">学习任务达成</h2>
          <p className="text-slate-400 text-xs mt-1">分数已累加至您的年度和累计积分中</p>
          <div className="my-6 p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <p className="text-5xl font-black text-blue-600">+{score}</p>
            <p className="text-slate-400 text-[10px] font-bold mt-2 tracking-widest uppercase">Points Awarded</p>
          </div>
          <button onClick={() => window.location.href='/mine'} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform">返回个人中心</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
