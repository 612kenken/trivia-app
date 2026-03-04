"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Trivia } from "@/types/trivia";

interface SwipeCardProps {
    trivia: Trivia;
    isActive: boolean;
    onSwipeRight: () => void;
    onSwipeLeft: () => void;
}

export default function SwipeCard({
    trivia,
    isActive,
    onSwipeRight,
    onSwipeLeft,
}: SwipeCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const controls = useAnimation();

    // xの移動量に応じて、カードを回転＆不透明度を下げる
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // いいね／スキップのテキスト表示の濃さ
    const likeOpacity = useTransform(x, [20, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

    const handleDragEnd = async (
        event: MouseEvent | TouchEvent | PointerEvent,
        info: { offset: { x: number; y: number } }
    ) => {
        const offset = info.offset.x;
        const velocity = info.offset.x; // 簡易的にoffsetを速度代わり/移動量として判定
        const threshold = 100;

        if (offset > threshold) {
            // 右スワイプ
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
            onSwipeRight();
        } else if (offset < -threshold) {
            // 左スワイプ
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
            onSwipeLeft();
        } else {
            // 元の位置に戻る
            controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    return (
        <motion.div
            ref={cardRef}
            className={`absolute w-full h-[60vh] max-h-[500px] shadow-2xl rounded-3xl bg-white flex flex-col items-center justify-center p-8 origin-bottom
        ${isActive ? "z-10 cursor-grab active:cursor-grabbing" : "z-0 scale-95 opacity-50 pointer-events-none"}
      `}
            style={{ x, rotate, opacity }}
            drag={isActive ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={false}
        >
            {/* いいね・スキップのインジケーター */}
            {isActive && (
                <>
                    <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute top-8 left-8 border-4 border-green-500 text-green-500 text-3xl font-bold uppercase py-2 px-4 rounded-xl -rotate-12"
                    >
                        LIKE
                    </motion.div>
                    <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute top-8 right-8 border-4 border-red-500 text-red-500 text-3xl font-bold uppercase py-2 px-4 rounded-xl rotate-12"
                    >
                        NOPE
                    </motion.div>
                </>
            )}

            <div className="text-6xl mb-6">{trivia.emoji}</div>
            <div className="text-sm font-semibold text-gray-500 tracking-wider mb-4 border border-gray-200 rounded-full px-4 py-1">
                {trivia.category}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 text-center leading-relaxed">
                {trivia.content}
            </p>
        </motion.div>
    );
}
