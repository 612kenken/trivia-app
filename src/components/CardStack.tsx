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
    const [seenIds, setSeenIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // 初回マウント時にLocalStorageから既読履歴を取得
    useEffect(() => {
        const saved = localStorage.getItem("seenTriviaIds");
        if (saved) {
            try {
                setSeenIds(JSON.parse(saved));
            } catch (e) {
                console.error("Local storage parse error:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // 広告を一定間隔（例：5枚ごと）で差し込むヘルパー関数
    const insertAds = (shuffledCards: Trivia[]) => {
        const withAds: Trivia[] = [];
        shuffledCards.forEach((card, i) => {
            if (i > 0 && i % 4 === 0) {
                withAds.push({
                    id: `ad-${Date.now()}-${i}`,
                    category: "スポンサー",
                    content: "ここに広告やおすすめ商品（アフィリエイトなど）が表示されます。タップして詳細をチェック！",
                    emoji: "📢"
                });
            }
            withAds.push(card);
        });
        return withAds;
    };

    // カテゴリが変更された時、または履歴ロード完了時に未読データのみでデッキをシャッフル
    useEffect(() => {
        if (!isLoaded) return;
        const unseen = trivias.filter((t) => !seenIds.includes(t.id));
        const shuffled = [...unseen].sort(() => Math.random() - 0.5);
        setDeck(insertAds(shuffled));
        setCurrentIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trivias, isLoaded]);

    const markAsSeen = (id: string) => {
        if (id.startsWith("ad-")) return; // 広告は履歴に含めない
        setSeenIds((prev) => {
            const next = Array.from(new Set([...prev, id]));
            localStorage.setItem("seenTriviaIds", JSON.stringify(next));
            return next;
        });
    };

    const handleSwipeRight = () => {
        const currentId = deck[currentIndex]?.id;
        if (currentId) markAsSeen(currentId);

        console.log("Liked:", currentId);
        if (currentId && !currentId.startsWith("ad-")) {
            setShowLikeEffect(true);
        }
        nextCard();
    };

    const handleSwipeLeft = () => {
        const currentId = deck[currentIndex]?.id;
        if (currentId) markAsSeen(currentId);

        console.log("Skipped:", currentId);
        nextCard();
    };

    const nextCard = () => {
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 200);
    };

    const handleRestart = () => {
        // 現在のカード一覧のIDを既読リストから除外し、このカテゴリだけ「一から見直す」
        const currentCategoryIds = trivias.map((t) => t.id);
        const newSeenIds = seenIds.filter((id) => !currentCategoryIds.includes(id));

        setSeenIds(newSeenIds);
        localStorage.setItem("seenTriviaIds", JSON.stringify(newSeenIds));

        const shuffled = [...trivias].sort(() => Math.random() - 0.5);
        setDeck(insertAds(shuffled));
        setCurrentIndex(0);
    };

    const isReady = deck.length > 0;
    const isFinished = isLoaded && (!isReady || currentIndex >= deck.length);

    // DOMハイドレーションエラーとちらつき防止のため初回ロード完了まで非表示
    if (!isLoaded) return null;

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
