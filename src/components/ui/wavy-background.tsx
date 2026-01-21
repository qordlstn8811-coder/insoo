"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
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
    const noiseRef = useRef(createNoise3D(Math.random));
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const wRef = useRef(0);
    const hRef = useRef(0);
    const ntRef = useRef(0);
    const animationId = useRef<number | null>(null);
    const isMobileRef = useRef<boolean>(false);
    const prefersReducedMotionRef = useRef(false);
    const lowPowerRef = useRef(false);

    useEffect(() => {
        const waveColors = colors ?? [
            "#38bdf8",
            "#818cf8",
            "#c084fc",
            "#e879f9",
            "#22d3ee",
        ];

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

        const getLowPower = () => {
            const memory = (navigator as { deviceMemory?: number }).deviceMemory;
            const cores = navigator.hardwareConcurrency;
            return (typeof memory === "number" && memory > 0 && memory <= 4)
                || (typeof cores === "number" && cores > 0 && cores <= 4);
        };

        const updatePerfFlags = () => {
            const media = window.matchMedia("(prefers-reduced-motion: reduce)");
            prefersReducedMotionRef.current = media.matches;
            lowPowerRef.current = getLowPower();
        };

        const shouldAnimate = () => !isMobileRef.current && !prefersReducedMotionRef.current && !lowPowerRef.current;

        const drawWave = (n: number, step: number) => {
            const ctx = ctxRef.current;
            if (!ctx) return;
            ntRef.current += getSpeed();
            const w = wRef.current;
            const h = hRef.current;
            for (let i = 0; i < n; i++) {
                ctx.beginPath();
                ctx.lineWidth = waveWidth || 50;
                ctx.strokeStyle = waveColors[i % waveColors.length];
                for (let x = 0; x < w; x += step) {
                    const y = noiseRef.current(x / 800, 0.3 * i, ntRef.current) * 100;
                    ctx.lineTo(x, y + h * 0.5);
                }
                ctx.stroke();
                ctx.closePath();
            }
        };

        const render = () => {
            const ctx = ctxRef.current;
            if (!ctx) return;
            ctx.fillStyle = backgroundFill || "black";
            ctx.globalAlpha = waveOpacity || 0.5;
            ctx.fillRect(0, 0, wRef.current, hRef.current);

            const animate = shouldAnimate();
            const step = animate ? 8 : 12;

            // Reduced motion / low power: draw fewer waves
            drawWave(animate ? 3 : 2, step);

            if (animate) {
                animationId.current = requestAnimationFrame(render);
            } else {
                animationId.current = null;
            }
        };

        const startRender = () => {
            if (animationId.current) {
                cancelAnimationFrame(animationId.current);
                animationId.current = null;
            }
            render();
        };

        const init = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctxRef.current = ctx;
            wRef.current = ctx.canvas.width = window.innerWidth;
            hRef.current = ctx.canvas.height = window.innerHeight;

            // Detect mobile
            isMobileRef.current = window.innerWidth < 768;
            updatePerfFlags();

            // Disable heavy blur on mobile
            ctx.filter = (isMobileRef.current || prefersReducedMotionRef.current || lowPowerRef.current)
                ? 'none'
                : `blur(${blur}px)`;

            ntRef.current = 0;
            startRender();
        };

        init();
        const handleResize = () => {
            const ctx = ctxRef.current;
            if (!ctx) return;
            wRef.current = ctx.canvas.width = window.innerWidth;
            hRef.current = ctx.canvas.height = window.innerHeight;
            isMobileRef.current = window.innerWidth < 768;
            updatePerfFlags();
            ctx.filter = (isMobileRef.current || prefersReducedMotionRef.current || lowPowerRef.current)
                ? 'none'
                : `blur(${blur}px)`;
            startRender();
        };

        const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleMotion = () => {
            updatePerfFlags();
            const ctx = ctxRef.current;
            if (ctx) {
                ctx.filter = (isMobileRef.current || prefersReducedMotionRef.current || lowPowerRef.current)
                    ? 'none'
                    : `blur(${blur}px)`;
            }
            startRender();
        };

        window.addEventListener("resize", handleResize);
        motionMedia.addEventListener("change", handleMotion);

        return () => {
            if (animationId.current) {
                cancelAnimationFrame(animationId.current);
            }
            window.removeEventListener("resize", handleResize);
            motionMedia.removeEventListener("change", handleMotion);
        };
    }, [backgroundFill, blur, colors, speed, waveOpacity, waveWidth]);

    const isSafari = typeof navigator !== "undefined"
        && navigator.userAgent.includes("Safari")
        && !navigator.userAgent.includes("Chrome");

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
