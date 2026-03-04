"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface LikeEffectProps {
    isActive: boolean;
    onComplete: () => void;
}

export default function LikeEffect({ isActive, onComplete }: LikeEffectProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isActive) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                onComplete();
            }, 1000); // 1秒でアニメーション終了
            return () => clearTimeout(timer);
        }
    }, [isActive, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
                    {/* 中央の巨大なハートがポップアップ */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0], rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute"
                    >
                        <Heart size={150} className="text-pink-500" fill="currentColor" />
                    </motion.div>

                    {/* 周りに散らばる小さなハート */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                            animate={{
                                scale: [0, 1, 0],
                                x: Math.cos((i * 60 * Math.PI) / 180) * 150,
                                y: Math.sin((i * 60 * Math.PI) / 180) * 150,
                                opacity: 0,
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute text-pink-400"
                        >
                            <Heart size={30} fill="currentColor" />
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
