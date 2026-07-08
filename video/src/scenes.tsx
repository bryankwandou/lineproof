import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { C, FONT, MONO } from "./theme";
import { Backdrop, Kicker, Wordmark, Logo, Ring, Badge, rise, hex } from "./ui";

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 22 }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap,
      padding: "0 160px",
      textAlign: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

const H1: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({
  children,
  delay = 0,
  size = 84,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: "-0.02em",
        color: C.text,
        maxWidth: 1500,
        ...rise(f, fps, delay),
      }}
    >
      {children}
    </div>
  );
};

const Sub: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 34,
        lineHeight: 1.5,
        color: C.dim,
        maxWidth: 1180,
        ...rise(f, fps, delay),
      }}
    >
      {children}
    </div>
  );
};

const grad = { background: `linear-gradient(92deg, ${C.green}, ${C.accent})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } as React.CSSProperties;

// ── Scene 1: Hook / problem ─────────────────────────────────────────────────
export const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = interpolate(f, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop tint={C.red} />
      <Center>
        <Kicker color={C.red}>The blind spot in every betting market</Kicker>
        <H1 delay={8}>
          104 World Cup matches. Millions in odds moving every second.
        </H1>
        <div style={{ height: 6, width: interpolate(line, [0, 1], [0, 520]), background: `linear-gradient(90deg, ${C.red}, transparent)`, borderRadius: 3 }} />
        <Sub delay={26}>
          When a line goes wrong — a stale price, a phantom arbitrage window, a suspicious jump — who catches it, and who can <span style={{ color: C.text }}>prove</span> it was caught?
        </Sub>
      </Center>
    </AbsoluteFill>
  );
};

// ── Scene 2: Positioning / the turn ─────────────────────────────────────────
export const SceneTurn: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(f, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Center>
        <Kicker>Most agents trade the odds</Kicker>
        <div style={{ position: "relative", ...rise(f, fps, 8) }}>
          <H1 size={92}>
            LineProof <span style={grad}>audits the market itself.</span>
          </H1>
        </div>
        <Sub delay={30}>
          An autonomous agent that watches the consensus feed, recomputes the fair line, flags what breaks, and signs every verdict on Solana.
        </Sub>
      </Center>
    </AbsoluteFill>
  );
};

// ── Scene 3: Logo reveal ────────────────────────────────────────────────────
export const SceneLogo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 } });
  const scale = interpolate(s, [0, 1], [0.82, 1]);
  const glow = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Center gap={34}>
        <div style={{ transform: `scale(${scale})`, filter: `drop-shadow(0 0 ${glow * 40}px ${hex(C.accent, 0.4)})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <Logo size={150} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 130, letterSpacing: "-0.02em", color: C.text }}>
              LineProof
            </span>
          </div>
        </div>
        <div style={{ ...rise(f, fps, 22) }}>
          <span style={{ fontFamily: MONO, fontSize: 30, color: C.dim, letterSpacing: "0.14em" }}>
            THE ODDS INTEGRITY LAYER
          </span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

// ── Scene 4: How it works — four stages ─────────────────────────────────────
const stages = [
  { n: "01", t: "INGEST", h: "Read the consensus", d: "Full-match 1X2 prices and score clocks for every fixture on the TxLINE snapshot feed." },
  { n: "02", t: "NORMALIZE", h: "Strip the vig", d: "Implied probabilities are de-margined into a fair line. The overround becomes a signal." },
  { n: "03", t: "DETECT", h: "Flag what breaks", d: "Stale quotes, arbitrage windows, vig collapse, and moves beyond three sigma of a fixture's own history." },
  { n: "04", t: "NOTARIZE", h: "Anchor the verdict", d: "A canonical SHA-256 of the scan lands in a Solana memo, signed by the agent wallet." },
];
export const SceneStages: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ padding: "120px 130px", flexDirection: "column", gap: 48 }}>
        <div style={{ ...rise(f, fps, 0) }}>
          <Kicker>How the agent works · no human in the loop</Kicker>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, flex: 1 }}>
          {stages.map((s, i) => (
            <div
              key={s.n}
              style={{
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderRadius: 18,
                padding: "38px 42px",
                ...rise(f, fps, 12 + i * 12),
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.accent, marginBottom: 16 }}>
                {s.n} · {s.t}
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.text, marginBottom: 12 }}>{s.h}</div>
              <div style={{ fontFamily: FONT, fontSize: 27, lineHeight: 1.45, color: C.dim }}>{s.d}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 5: Live integrity board (recreated dashboard) ─────────────────────
const rows = [
  { home: "Argentina", away: "Egypt", comp: "World Cup", st: "LIVE", quoted: "3.06 / 2.89 / 3.07", fair: "3.05 / 2.89 / 3.07", vig: "0.01%", score: 100, verdict: "CLEAN" as const },
  { home: "France", away: "Morocco", comp: "World Cup", st: "PRE", quoted: "1.63 / 4.20 / 6.84", fair: "1.62 / 4.20 / 6.84", vig: "0.00%", score: 100, verdict: "CLEAN" as const },
  { home: "Switzerland", away: "Colombia", comp: "World Cup", st: "PRE", quoted: "3.68 / 3.25 / 2.38", fair: "3.68 / 3.25 / 2.38", vig: "-0.01%", score: 72, verdict: "WATCH" as const },
  { home: "Brazil", away: "Germany", comp: "World Cup", st: "LIVE", quoted: "2.10 / 3.20 / 3.50", fair: "2.04 / 3.20 / 3.62", vig: "6.2%", score: 54, verdict: "FLAGGED" as const },
];
export const SceneBoard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ringProg = interpolate(f, [30, 70], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ padding: "96px 120px", flexDirection: "column", gap: 30 }}>
        <div style={{ ...rise(f, fps, 0), display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <Kicker>Live integrity board</Kicker>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.faint, ...rise(f, fps, 6) }}>
            digest 8175ef3b55a1701f… · lineproof-rho.vercel.app
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden", ...rise(f, fps, 8) }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1.3fr 1.3fr 0.8fr 0.9fr 1.1fr", padding: "22px 40px", borderBottom: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 20, letterSpacing: "0.1em", color: C.faint }}>
            <div>FIXTURE</div><div>QUOTED 1X2</div><div>FAIR LINE</div><div>MARGIN</div><div>INTEGRITY</div><div>VERDICT</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.home}
              style={{
                display: "grid",
                gridTemplateColumns: "2.1fr 1.3fr 1.3fr 0.8fr 0.9fr 1.1fr",
                alignItems: "center",
                padding: "26px 40px",
                borderBottom: i < rows.length - 1 ? `1px solid #131a23` : "none",
                ...rise(f, fps, 16 + i * 9),
              }}
            >
              <div>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.text }}>{r.home} vs {r.away}</div>
                <div style={{ fontFamily: MONO, fontSize: 19, color: C.faint, marginTop: 4 }}>{r.comp} · {r.st}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.dim }}>{r.quoted}</div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.dim }}>{r.fair}</div>
              <div style={{ fontFamily: MONO, fontSize: 24, color: r.score < 60 ? C.red : C.dim }}>{r.vig}</div>
              <div><Ring value={r.score} size={72} progress={ringProg} /></div>
              <div><Badge verdict={r.verdict} /></div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 6: TxLINE integration ─────────────────────────────────────────────
const endpoints = [
  "POST /auth/guest/start",
  "GET /api/fixtures/snapshot",
  "GET /api/odds/snapshot/{id}",
  "GET /api/scores/snapshot/{id}",
];
export const SceneTxline: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flow = interpolate(f, [20, 80], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop tint={C.green} />
      <AbsoluteFill style={{ padding: "110px 130px", flexDirection: "column", gap: 40 }}>
        <div style={{ ...rise(f, fps, 0) }}>
          <Kicker color={C.green}>Powered by the TxLINE consensus feed</Kicker>
        </div>
        <H1 delay={6} size={64}>Live odds in. Signed verdicts out.</H1>
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 20 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            {endpoints.map((e, i) => (
              <div
                key={e}
                style={{
                  fontFamily: MONO,
                  fontSize: 28,
                  color: C.text,
                  background: C.bg2,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "20px 28px",
                  ...rise(f, fps, 14 + i * 10),
                }}
              >
                <span style={{ color: C.green }}>{e.split(" ")[0]}</span> {e.split(" ")[1]}
              </div>
            ))}
          </div>
          <div style={{ width: 3, height: 320, background: `linear-gradient(${C.green}, ${C.accent})`, opacity: flow, borderRadius: 2 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20, ...rise(f, fps, 40) }}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.faint }}>DETERMINISTIC ENGINE</div>
            <div style={{ fontFamily: FONT, fontSize: 32, color: C.dim, lineHeight: 1.5 }}>
              Same snapshot in → byte-identical report out → one SHA-256 digest anyone can recompute.
            </div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.green, background: hex(C.green, 0.1), borderRadius: 10, padding: "16px 22px" }}>
              prices in milliunits · 1X2_PARTICIPANT_RESULT
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 7: On-chain proof (the money shot) ────────────────────────────────
export const SceneProof: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spring({ frame: f - 40, fps, config: { damping: 12, stiffness: 120 } });
  const stampScale = interpolate(stamp, [0, 1], [1.6, 1], { extrapolateRight: "clamp" });
  const stampOp = interpolate(f, [40, 52], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ padding: "110px 130px", flexDirection: "column", gap: 34, justifyContent: "center" }}>
        <div style={{ ...rise(f, fps, 0) }}>
          <Kicker>Every verdict, notarized on Solana devnet</Kicker>
        </div>
        <H1 delay={6} size={62}>You don't trust us. You check the chain.</H1>
        <div
          style={{
            background: C.bg2,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: "40px 46px",
            fontFamily: MONO,
            marginTop: 14,
            ...rise(f, fps, 16),
          }}
        >
          <div style={{ fontSize: 22, color: C.faint, marginBottom: 14 }}>MEMO · agent Fk5aPKEGah…VYsRgvd</div>
          <div style={{ fontSize: 26, color: C.text, lineHeight: 1.6, wordBreak: "break-all" }}>
            <span style={{ color: C.accent }}>lineproof:v1</span>:scan-1783489353140:
            <span style={{ color: C.green }}>5fda66e173046e0233b5085ee49d1d043f872664aedd3eb6379522e66432fcbf</span>
            :matches=1:flagged=0
          </div>
          <div style={{ fontSize: 22, color: C.faint, marginTop: 20 }}>
            tx 3GiTtbRbm845YKtoY8LiStHFhZZwyFCQgBKYUYpcFyVHR5MRPtv5793EfHv1j8xiznBfq17K1hLwtYW1ou9kx4dj
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 150,
            top: 250,
            transform: `scale(${stampScale}) rotate(-14deg)`,
            opacity: stampOp,
            border: `4px solid ${C.green}`,
            color: C.green,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "0.1em",
            padding: "14px 30px",
            borderRadius: 12,
          }}
        >
          ON-CHAIN ✓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 8: Why it wins ────────────────────────────────────────────────────
const pillars = [
  { k: "AUTONOMOUS", v: "Scans every 5 min via GitHub Actions. Zero human input once deployed." },
  { k: "DEFENSIBLE", v: "De-vig + z-score math a risk desk would sign off on. Pure and reproducible." },
  { k: "TAMPER-EVIDENT", v: "The audit trail lives on-chain. Not even the operator can rewrite it." },
  { k: "PRODUCTION-READY", v: "Two JSON endpoints, no auth on reads. A sportsbook can integrate today." },
];
export const SceneWhy: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ padding: "120px 130px", flexDirection: "column", gap: 46 }}>
        <div style={{ ...rise(f, fps, 0) }}>
          <Kicker>Built to win — and to scale past the hackathon</Kicker>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, flex: 1 }}>
          {pillars.map((p, i) => (
            <div
              key={p.k}
              style={{
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderRadius: 18,
                padding: "40px 46px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 14,
                ...rise(f, fps, 10 + i * 11),
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.08em", ...grad }}>{p.k}</div>
              <div style={{ fontFamily: FONT, fontSize: 30, lineHeight: 1.45, color: C.dim }}>{p.v}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 9: CTA / end card ─────────────────────────────────────────────────
export const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Center gap={34}>
        <div style={{ ...rise(f, fps, 0) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Logo size={96} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, color: C.text, letterSpacing: "-0.02em" }}>LineProof</span>
          </div>
        </div>
        <H1 delay={10} size={52}>The market finally has a witness.</H1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20, ...rise(f, fps, 24) }}>
          {[
            ["Live", "lineproof-rho.vercel.app"],
            ["Code", "github.com/nayrbryanGaming/lineproof"],
            ["Feed", "/api/report · /api/scan · /api/attestations"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 20, alignItems: "baseline", justifyContent: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 26, color: C.faint, width: 90, textAlign: "right" }}>{k}</span>
              <span style={{ fontFamily: MONO, fontSize: 30, color: C.accent }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 24, color: C.faint, letterSpacing: "0.1em", ...rise(f, fps, 40) }}>
          TxODDS WORLD CUP · TRADING TOOLS AND AGENTS
        </div>
      </Center>
    </AbsoluteFill>
  );
};
