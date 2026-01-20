"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
    children,
    className,
    containerClassName,
    colors,
    waveWidth,
    backgroundFill,
    blur = 10,
    speed = "fast",
    waveOpacity = 0.5,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    colors?: string[];
    waveWidth?: number;
    backgroundFill?: string;
    blur?: number;
    speed?: "slow" | "fast";
    waveOpacity?: number;
}) => {
    const noise = createNoise3D(Math.random);
    let w: number,
        h: number,
        nt: number,
        i: number,
        x: number,
        ctx: CanvasRenderingContext2D | null,
        canvas: HTMLCanvasElement | null;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const getSpeed = () => {
        switch (speed) {
            case "slow":
                return 0.001;
            case "fast":
                return 0.002;
            default:
                return 0.001;
        }
    };

    const animationId = useRef<number | null>(null);
    const isMobileRef = useRef<boolean>(false);

    const init = () => {
        canvas = canvasRef.current;
        if (!canvas) return;
        ctx = canvas.getContext("2d");
        if (!ctx) return;
        w = ctx.canvas.width = window.innerWidth;
        h = ctx.canvas.height = window.innerHeight;

        // Detect mobile
        isMobileRef.current = window.innerWidth < 768;

        // Disable heavy blur on mobile
        ctx.filter = isMobileRef.current ? 'none' : `blur(${blur}px)`;

        nt = 0;
        window.onresize = function () {
            if (!ctx) return;
            w = ctx.canvas.width = window.innerWidth;
            h = ctx.canvas.height = window.innerHeight;

            isMobileRef.current = window.innerWidth < 768;
            ctx.filter = isMobileRef.current ? 'none' : `blur(${blur}px)`;
        };
        render();
    };

    const waveColors = colors ?? [
        "#38bdf8",
        "#818cf8",
        "#c084fc",
        "#e879f9",
        "#22d3ee",
    ];
    const drawWave = (n: number) => {
        if (!ctx) return;
        nt += getSpeed();
        for (i = 0; i < n; i++) {
            ctx.beginPath();
            ctx.lineWidth = waveWidth || 50;
            ctx.strokeStyle = waveColors[i % waveColors.length];
            for (x = 0; x < w; x += 5) {
                const y = noise(x / 800, 0.3 * i, nt) * 100;
                ctx.lineTo(x, y + h * 0.5);
            }
            ctx.stroke();
            ctx.closePath();
        }
    };

    const render = () => {
        if (!ctx) return;
        ctx.fillStyle = backgroundFill || "black";
        ctx.globalAlpha = waveOpacity || 0.5;
        ctx.fillRect(0, 0, w, h);

        // Mobile: Draw fewer waves
        drawWave(isMobileRef.current ? 2 : 5);

        // Mobile: Stop animation (render once)
        if (!isMobileRef.current) {
            animationId.current = requestAnimationFrame(render);
        }
    };

    useEffect(() => {
        init();
        return () => {
            if (animationId.current) {
                cancelAnimationFrame(animationId.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [isSafari, setIsSafari] = useState(false);
    useEffect(() => {
        // Safari check for potential blur performance issues
        setIsSafari(
            typeof window !== "undefined" &&
            navigator.userAgent.includes("Safari") &&
            !navigator.userAgent.includes("Chrome")
        );
    }, []);

    return (
        <div
            {...props}
            className={cn(
                "h-screen flex flex-col items-center justify-center",
                containerClassName
            )}
        >
            <canvas
                className="absolute inset-0 z-0"
                ref={canvasRef}
                id="canvas"
                style={{
                    ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
                }}
            ></canvas>
            <div className={cn("relative z-10", className)}>
                {children}
            </div>
        </div>
    );
};
