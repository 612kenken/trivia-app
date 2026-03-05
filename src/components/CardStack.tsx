"use client";

import { useState, useEffect } from "react";
import SwipeCard from "./SwipeCard";
import LikeEffect from "./LikeEffect";
import { Trivia } from "@/types/trivia";
import { Heart, X } from "lucide-react";

interface CardStackProps {
    trivias: Trivia[];
}

export default function CardStack({ trivias }: CardStackProps) {
    const [deck, setDeck] = useState<Trivia[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLikeEffect, setShowLikeEffect] = useState(false);

    // カテゴリが変更された時、または初期ロード時にデータをシャッフルしてセット
    useEffect(() => {
        const shuffled = [...trivias].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
        setCurrentIndex(0);
    }, [trivias]);

    const handleSwipeRight = () => {
        console.log("Liked:", deck[currentIndex]?.id);
        setShowLikeEffect(true);
        nextCard();
    };

    const handleSwipeLeft = () => {
        console.log("Skipped:", deck[currentIndex]?.id);
        nextCard();
    };

    const nextCard = () => {
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 200);
    };

    const handleRestart = () => {
        const shuffled = [...trivias].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
        setCurrentIndex(0);
    };

    const isReady = deck.length > 0;
    const isFinished = isReady && currentIndex >= deck.length;

    if (!isReady) return null;

    return (
        <div className="flex flex-col flex-1 items-center w-full max-w-sm mx-auto justify-center relative mt-16">
            <div className="relative w-full h-[60vh] max-h-[500px] mb-8">
                {isFinished ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20">
                        <span className="text-6xl mb-4">🎉</span>
                        <p className="text-xl font-bold">すべての雑学を見終わりました！</p>
                        <button
                            onClick={handleRestart}
                            className="mt-6 px-6 py-3 bg-white text-purple-600 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                        >
                            もう一度見る
                        </button>
                    </div>
                ) : (
                    deck.map((trivia, index) => {
                        // 現在のインデックスより前のカードは表示しない
                        if (index < currentIndex) return null;
                        // 現在のインデックスから3枚先まで描画する
                        if (index > currentIndex + 2) return null;

                        const isTop = index === currentIndex;
                        // 下にあるカードほど小さく、下にずらし、不透明度を下げる
                        const offset = (index - currentIndex) * 8;
                        const scale = 1 - (index - currentIndex) * 0.05;
                        const zIndex = deck.length - index;

                        return (
                            <div
                                key={trivia.id}
                                className="absolute inset-0 transition-transform duration-300 ease-out"
                                style={{
                                    transform: `translateY(${offset}px) scale(${scale})`,
                                    zIndex: zIndex
                                }}
                            >
                                <SwipeCard
                                    trivia={trivia}
                                    isActive={isTop}
                                    onSwipeLeft={handleSwipeLeft}
                                    onSwipeRight={handleSwipeRight}
                                />
                            </div>
                        );
                    })
                )}

                {/* いいねエフェクトの表示 */}
                <LikeEffect
                    isActive={showLikeEffect}
                    onComplete={() => setShowLikeEffect(false)}
                />
            </div>

            {/* アクションボタン */}
            {!isFinished && (
                <div className="flex gap-8 justify-center pb-8 z-20">
                    <button
                        onClick={handleSwipeLeft}
                        className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 hover:bg-red-50 transition-all"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button
                        onClick={handleSwipeRight}
                        className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 hover:bg-green-50 transition-all"
                    >
                        <Heart size={32} strokeWidth={3} fill="currentColor" />
                    </button>
                </div>
            )}
        </div>
    );
}
