"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
    items,
    direction = "left",
    speed = "fast",
    pauseOnHover = true,
    className,
}: {
    items: {
        quote: string;
        name: string;
        title: string;
    }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollerRef = React.useRef<HTMLUListElement>(null);
    const [reduceMotion, setReduceMotion] = useState(false);

    const hasClonedRef = React.useRef(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduceMotion(mediaQuery.matches);
        update();
        mediaQuery.addEventListener("change", update);

        return () => {
            mediaQuery.removeEventListener("change", update);
        };
    }, []);

    useEffect(() => {
        if (reduceMotion) {
            return;
        }
        if (!containerRef.current || !scrollerRef.current || hasClonedRef.current) {
            return;
        }

        const scrollerContent = Array.from(scrollerRef.current.children);

        scrollerContent.forEach((item) => {
            const duplicatedItem = item.cloneNode(true);
            scrollerRef.current?.appendChild(duplicatedItem);
        });

        hasClonedRef.current = true;
    }, [reduceMotion]);

    useEffect(() => {
        if (reduceMotion) {
            return;
        }
        if (containerRef.current) {
            if (direction === "left") {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "forwards"
                );
            } else {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "reverse"
                );
            }
        }
    }, [direction, reduceMotion]);

    useEffect(() => {
        if (reduceMotion) {
            return;
        }
        if (containerRef.current) {
            if (speed === "fast") {
                containerRef.current.style.setProperty("--animation-duration", "20s");
            } else if (speed === "normal") {
                containerRef.current.style.setProperty("--animation-duration", "40s");
            } else {
                containerRef.current.style.setProperty("--animation-duration", "80s");
            }
        }
    }, [speed, reduceMotion]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20  max-w-7xl overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
                className
            )}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
                    !reduceMotion && "animate-scroll",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {items.map((item) => (
                    <li
                        className="w-[350px] max-w-full relative rounded-2xl border border-blue-100 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
                        style={{
                            background:
                                "linear-gradient(180deg, var(--white), var(--slate-50))",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                        }}
                        key={item.name}
                    >
                        <blockquote>
                            <div
                                aria-hidden="true"
                                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                            ></div>
                            <span className=" relative z-20 text-sm leading-[1.6] text-gray-700 font-normal">
                                {item.quote}
                            </span>
                            <div className="relative z-20 mt-6 flex flex-row items-center">
                                <span className="flex flex-col gap-1">
                                    <span className=" text-sm leading-[1.6] text-gray-900 font-bold">
                                        {item.name}
                                    </span>
                                    <span className=" text-sm leading-[1.6] text-gray-500 font-normal">
                                        {item.title}
                                    </span>
                                </span>
                            </div>
                        </blockquote>
                    </li>
                ))}
            </ul>
        </div>
    );
};
