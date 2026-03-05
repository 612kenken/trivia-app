"use client";

import { useState, useMemo } from "react";
import CardStack from "@/components/CardStack";
import { initialTrivias } from "@/data/trivia";

export default function Home() {
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
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden touch-none">

      {/* ヘッダーエリア */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 text-white">
        <h1 className="text-2xl font-black tracking-tighter opacity-80">TRIVIA</h1>
        <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold opacity-80 cursor-pointer hover:bg-white/30 transition-colors">
          保存した雑学
        </div>
      </div>

      {/* カテゴリ選択（横スクロール） */}
      <div className="absolute top-20 w-full px-4 z-20 flex overflow-x-auto pb-4 pt-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-2 mx-auto sm:mx-0 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                  ? "bg-white text-indigo-700 shadow-lg scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mt-12 w-full flex justify-center">
        <CardStack trivias={filteredTrivias} />
      </div>

      {/* 背景装飾 */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-4000"></div>

    </main>
  );
}
