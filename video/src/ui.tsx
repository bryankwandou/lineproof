import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, MONO } from "./theme";

// Subtle animated backdrop shared by every scene — radial glows + grain feel,
// with a slow drift so resting frames never look dead.
export const Backdrop: React.FC<{ tint?: string }> = ({ tint = C.accent }) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 60) * 24;
  const drift2 = Math.cos(f / 80) * 30;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(720px 460px at ${22 + drift / 8}% ${18 + drift / 12}%, ${hex(tint, 0.16)}, transparent 62%),
            radial-gradient(620px 420px at ${78 + drift2 / 8}% ${10 + drift2 / 12}%, ${hex(C.green, 0.1)}, transparent 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 45%, black, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

export function hex(h: string, a: number) {
  const n = parseInt(h.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

// Spring-in on a delay; returns opacity + translateY for staggered entrances.
export function rise(frame: number, fps: number, delay: number, dist = 28) {
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [dist, 0])}px)`,
  };
}

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = C.accent,
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 26,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        ...rise(f, fps, delay),
      }}
    >
      {children}
    </div>
  );
};

export const Logo: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="url(#lg)" strokeWidth="2.5" />
    <path d="M9 20 L14 12 L18 17 L23 9" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="23" cy="9" r="2.4" fill={C.green} />
    <defs>
      <linearGradient id="lg" x1="0" y1="32" x2="32" y2="0">
        <stop stopColor={C.accent} />
        <stop offset="1" stopColor={C.green} />
      </linearGradient>
    </defs>
  </svg>
);

export const Wordmark: React.FC<{ size?: number; delay?: number }> = ({ size = 44, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32, ...rise(f, fps, delay) }}>
      <Logo size={size} />
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: "-0.01em", color: C.text }}>
        LineProof
      </span>
    </div>
  );
};

// Integrity ring identical in spirit to the dashboard's SVG ring.
export const Ring: React.FC<{ value: number; size?: number; progress?: number }> = ({
  value,
  size = 92,
  progress = 1,
}) => {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const col = value >= 85 ? C.green : value >= 60 ? C.amber : C.red;
  const off = circ * (1 - (value / 100) * progress);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a222d" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: size * 0.26,
          color: col,
          fontWeight: 600,
        }}
      >
        {Math.round(value * progress)}
      </div>
    </div>
  );
};

export const Badge: React.FC<{ verdict: "CLEAN" | "WATCH" | "FLAGGED" }> = ({ verdict }) => {
  const col = verdict === "CLEAN" ? C.green : verdict === "WATCH" ? C.amber : C.red;
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 18,
        letterSpacing: "0.06em",
        color: col,
        background: hex(col, 0.13),
        padding: "6px 16px",
        borderRadius: 20,
      }}
    >
      {verdict}
    </span>
  );
};
