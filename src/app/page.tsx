"use client";

import { useState, useMemo } from "react";
import CardStack from "@/components/CardStack";
import { initialTrivias } from "@/data/trivia";
import { ChevronLeft, Bookmark, BrainCircuit, CheckCircle2, XCircle } from "lucide-react";
import { Trivia } from "@/types/trivia";

type ViewState = "category_select" | "playing" | "saved_trivias" | "quiz_mode";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("category_select");
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  // クイズ用のステート
  const [quizQuestion, setQuizQuestion] = useState<Trivia | null>(null);
  const [quizOptions, setQuizOptions] = useState<Trivia[]>([]);
  const [quizResult, setQuizResult] = useState<"none" | "correct" | "incorrect">("none");
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  // 保存済みの雑学オブジェクトリストを作成（画面切り替え時にその都度Storageから抽出）
  const savedTriviasList = useMemo(() => {
    if (typeof window === "undefined" || viewState !== "saved_trivias") return [];
    const saved = localStorage.getItem("seenTriviaIds");
    if (!saved) return [];
    try {
      const savedIds = JSON.parse(saved) as string[];
      return initialTrivias.filter(t => savedIds.includes(t.id));
    } catch {
      return [];
    }
  }, [viewState]);

  // 初期データからカテゴリ一覧を自動抽出（重複排除）
  const categories = useMemo(() => {
    const cats = Array.from(new Set(initialTrivias.map((t) => t.category)));
    return ["すべて", ...cats];
  }, []);

  // 選択されたカテゴリでデータを絞り込む
  const filteredTrivias = useMemo(() => {
    if (selectedCategory === "すべて") return initialTrivias;
    return initialTrivias.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // UIタップ音再生用ヘルパー
  const playButtonSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  };

  const handleSelectCategory = (cat: string) => {
    playButtonSound();
    setSelectedCategory(cat);
    setViewState("playing");
  };

  // --- クイズロジックヘルパー ---
  const generateQuiz = () => {
    if (savedTriviasList.length === 0) return;
    setQuizResult("none");
    setSelectedAnswerId(null);

    // 正解を「保存した雑学」から1つランダムに選ぶ
    const targetInfo = savedTriviasList[Math.floor(Math.random() * savedTriviasList.length)];
    setQuizQuestion(targetInfo);

    // ダミーの選択肢を全体データ（正解以外）から3つランダムに選ぶ
    const otherTrivias = initialTrivias.filter(t => t.id !== targetInfo.id && t.category !== "スポンサー");
    const shuffledOthers = [...otherTrivias].sort(() => Math.random() - 0.5);
    const dummyOptions = shuffledOthers.slice(0, 3);

    // 正解＋ダミー3つをシャッフルして4択を作成
    const allOptions = [...dummyOptions, targetInfo].sort(() => Math.random() - 0.5);
    setQuizOptions(allOptions);
  };

  const handleStartQuiz = () => {
    if (savedTriviasList.length === 0) {
      alert("まずは雑学を右スワイプ（LIKE）して保存してください！");
      return;
    }
    playButtonSound();
    generateQuiz();
    setViewState("quiz_mode");
  };

  const handleAnswerClick = (optionId: string) => {
    if (quizResult !== "none") return; // 既に回答済みの場合は無効
    setSelectedAnswerId(optionId);

    if (optionId === quizQuestion?.id) {
      // 正解音
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch { }
      setQuizResult("correct");
    } else {
      // 不正解音
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch { }
      setQuizResult("incorrect");
    }
  };
  // -------------------------
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">

      {/* ヘッダーエリア */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-30 text-white">
        {viewState !== "category_select" ? (
          <button
            onClick={() => {
              playButtonSound();
              setViewState("category_select");
            }}
            className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-full backdrop-blur-md text-sm font-bold opacity-80 cursor-pointer hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={18} />
            戻る
          </button>
        ) : (
          <h1 className="text-2xl font-black tracking-tighter opacity-80 z-30">TRIVIA</h1>
        )}

        <div className="flex gap-2 ml-auto z-30">
          {viewState === "category_select" && (
            <button
              onClick={handleStartQuiz}
              className="flex items-center gap-1 bg-gradient-to-r from-pink-500/80 to-purple-500/80 px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <BrainCircuit size={16} />
              クイズ
            </button>
          )}

          {viewState !== "saved_trivias" && (
            <button
              onClick={() => {
                playButtonSound();
                setViewState("saved_trivias");
              }}
              className="flex items-center gap-1 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold opacity-80 cursor-pointer hover:bg-white/30 transition-colors"
            >
              <Bookmark size={16} />
              保存一覧
            </button>
          )}
        </div>
      </div>

      {/* 画面切り替え */}
      {viewState === "quiz_mode" && quizQuestion ? (
        <div className="z-20 flex flex-col items-center w-full max-w-sm mt-16 px-4">
          <h2 className="text-white/80 text-lg font-bold mb-2 tracking-widest flex items-center gap-2">
            <BrainCircuit /> 確認テスト
          </h2>
          <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 mb-6 shadow-xl text-center">
            <div className="text-5xl mb-4">{quizQuestion.emoji}</div>
            <p className="text-white text-xl font-bold leading-relaxed">
              この雑学の「正しい内容」はどれでしょう？
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {quizOptions.map((opt) => {
              const isSelected = selectedAnswerId === opt.id;
              const isCorrectOpt = opt.id === quizQuestion.id;

              // 選択後のボタンスタイル決定
              let btnClass = "bg-white/90 text-gray-800 hover:bg-white";
              if (quizResult !== "none") {
                if (isCorrectOpt) {
                  btnClass = "bg-green-500 text-white border-2 border-green-400 font-bold scale-105 shadow-green-500/50";
                } else if (isSelected) {
                  btnClass = "bg-red-500 text-white opacity-90 border-2 border-red-400";
                } else {
                  btnClass = "bg-white/50 text-gray-800 opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswerClick(opt.id)}
                  disabled={quizResult !== "none"}
                  className={`w-full text-left p-4 rounded-2xl shadow-sm transition-all duration-300 relative ${btnClass}`}
                >
                  <span className="block text-sm font-bold line-clamp-3 leading-relaxed">
                    {opt.content}
                  </span>

                  {/* 正解/不正解アイコン表示 */}
                  {quizResult !== "none" && isCorrectOpt && (
                    <span className="absolute -top-3 -right-3 text-green-400 bg-white rounded-full">
                      <CheckCircle2 size={32} />
                    </span>
                  )}
                  {quizResult !== "none" && !isCorrectOpt && isSelected && (
                    <span className="absolute -top-3 -right-3 text-red-400 bg-white rounded-full">
                      <XCircle size={32} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {quizResult !== "none" && (
            <button
              onClick={() => {
                playButtonSound();
                generateQuiz();
              }}
              className="mt-8 bg-white text-purple-600 font-black py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              次の問題へ
            </button>
          )}
        </div>
      ) : viewState === "saved_trivias" ? (
        <div className="z-20 flex flex-col items-center w-full h-full max-w-lg mt-20 px-4 overflow-y-auto pb-10" style={{ scrollbarWidth: 'none' }}>
          <h2 className="text-white text-2xl font-bold mb-6 tracking-wider flex items-center gap-2">
            <Bookmark /> 保存した雑学
          </h2>
          {savedTriviasList.length === 0 ? (
            <div className="text-white/70 text-center mt-10">
              まだ保存された雑学がありません。<br />右スワイプで保存してみましょう！
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {savedTriviasList.reverse().map((trivia) => (
                <div key={trivia.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{trivia.emoji}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-full">{trivia.category}</span>
                  </div>
                  <p className="font-bold text-lg leading-relaxed">{trivia.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewState === "category_select" ? (
        <div className="z-20 flex flex-col items-center w-full max-w-sm mt-12">
          <h2 className="text-white text-3xl font-bold mb-8 tracking-wider">ジャンルを選ぶ</h2>
          <div className="grid grid-cols-2 gap-4 w-full px-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className="flex flex-col items-center justify-center aspect-square bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl transition-all hover:scale-105 active:scale-95 group"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat === "すべて" ? "🌌" : initialTrivias.find(t => t.category === cat)?.emoji || "💡"}
                </span>
                <span className="text-white font-bold tracking-widest">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12 w-full flex justify-center z-20">
          <CardStack trivias={filteredTrivias} />
        </div>
      )}

      {/* 背景装飾 */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-4000"></div>

    </main>
  );
}
