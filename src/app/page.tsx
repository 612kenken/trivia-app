"use client";

import { useState, useMemo } from "react";
import CardStack from "@/components/CardStack";
import { initialTrivias } from "@/data/trivia";
import { ChevronLeft } from "lucide-react";

type ViewState = "category_select" | "playing";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("category_select");
  const [selectedCategory, setSelectedCategory] = useState("すべて");

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

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setViewState("playing");
  };
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">

      {/* ヘッダーエリア */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 text-white">
        {viewState === "playing" ? (
          <button
            onClick={() => setViewState("category_select")}
            className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-full backdrop-blur-md text-sm font-bold opacity-80 cursor-pointer hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={18} />
            戻る
          </button>
        ) : (
          <h1 className="text-2xl font-black tracking-tighter opacity-80">TRIVIA</h1>
        )}
        <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold opacity-80 cursor-pointer hover:bg-white/30 transition-colors ml-auto">
          保存した雑学
        </div>
      </div>

      {/* 画面切り替え */}
      {viewState === "category_select" ? (
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
