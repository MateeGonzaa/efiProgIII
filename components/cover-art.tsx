// Portadas ilustradas en SVG: nítidas en cualquier tamaño y sin depender de servicios externos (cero demora de carga).
import type { ReactNode } from "react";
export type CoverKind = "comic" | "manga" | "fantasy";

export function coverKind(name?: string): CoverKind {
  const n = (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (n.startsWith("manga")) return "manga";
  if (n.startsWith("fant") || n.startsWith("libro")) return "fantasy";
  return "comic";
}

const rnd = (seed: number) => { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
const P = {
  comic: [["#ff4b2e", "#5a0f1a", "#ffd166"], ["#f2b632", "#c9302c", "#16255a"], ["#2a7fd0", "#0e2347", "#ff5a3c"]],
  manga: [["#1b1b1f", "#050506", "#e0281d"], ["#14414a", "#071014", "#38c7bd"], ["#2a1f1a", "#0a0706", "#f2e6cf"]],
  fantasy: [["#10304a", "#2d6578", "#f0c96a"], ["#2d1a44", "#8a4278", "#f6a65a"], ["#173a26", "#5b8a4c", "#ecdca8"]],
} as const;

export function CoverArt({ kind, seed = 0, className = "cover-art" }: { kind: CoverKind; seed?: number; className?: string }) {
  const v = Math.abs(seed) % 3;
  const [c1, c2, accent] = P[kind][v];
  const r = rnd(seed + 7);
  const gid = `g-${kind}-${v}`;
  const els: ReactNode[] = [];

  if (kind === "comic") {
    const off = r() * 15;
    for (let i = 0; i < 24; i++) {
      const a = ((i * 15 + off) * Math.PI) / 180, b = a + (7.5 * Math.PI) / 180;
      els.push(<polygon key={`ray${i}`} points={`150,165 ${150 + 520 * Math.cos(a)},${165 + 520 * Math.sin(a)} ${150 + 520 * Math.cos(b)},${165 + 520 * Math.sin(b)}`} fill="#fff" opacity=".11" />);
    }
    els.push(
      <rect key="dots" width="300" height="435" fill={`url(#dots-${v})`} opacity=".35" />,
      <path key="capeL" d="M84 345 L36 318 Q62 238 104 214 Z" fill="#0b0b12" opacity=".92" />,
      <path key="capeR" d="M216 345 L264 318 Q238 238 196 214 Z" fill="#0b0b12" opacity=".92" />,
      <path key="body" d="M78 350 Q86 218 150 202 Q214 218 222 350 Z" fill="#0b0b12" />,
      <circle key="head" cx="150" cy="158" r="27" fill="#0b0b12" />,
      <polygon key="eyeL" points="132,154 147,158 134,164" fill="#fff" />,
      <polygon key="eyeR" points="168,154 153,158 166,164" fill="#fff" />,
      <polygon key="emblem" points="150,236 157,254 176,254 161,265 167,283 150,272 133,283 139,265 124,254 143,254" fill={accent} />,
      <polygon key="star" points="238,64 246,88 272,88 251,103 259,128 238,113 217,128 225,103 204,88 230,88" fill={accent} opacity=".95" />,
    );
  }

  if (kind === "manga") {
    els.push(<circle key="sun" cx="150" cy="165" r="86" fill={accent} opacity=".92" />);
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2, r0 = 70 + r() * 70, r1 = 330 + r() * 120;
      els.push(<line key={`l${i}`} x1={150 + r0 * Math.cos(a)} y1={165 + r0 * Math.sin(a)} x2={150 + r1 * Math.cos(a)} y2={165 + r1 * Math.sin(a)} stroke="#f6f1e7" strokeWidth={0.5 + r() * 2.2} opacity={0.25 + r() * 0.5} />);
    }
    const hair = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; const rad = i % 2 ? 50 : 92 - r() * 14; return `${150 + rad * Math.cos(a)},${165 + rad * Math.sin(a)}`; }).join(" ");
    els.push(
      <polygon key="hair" points={hair} fill="#070708" />,
      <circle key="face" cx="150" cy="172" r="40" fill="#f2e6d0" />,
      <path key="browL" d="M122 160 L144 168" stroke="#070708" strokeWidth="5" strokeLinecap="round" />,
      <path key="browR" d="M178 160 L156 168" stroke="#070708" strokeWidth="5" strokeLinecap="round" />,
      <circle key="ring" cx="150" cy="165" r="108" fill="none" stroke="#f6f1e7" strokeWidth="2" strokeDasharray="3 9" opacity=".7" />,
      <path key="slash" d="M-10 300 L310 230" stroke={accent} strokeWidth="5" opacity=".85" />,
    );
  }

  if (kind === "fantasy") {
    for (let i = 0; i < 46; i++) els.push(<circle key={`s${i}`} cx={r() * 300} cy={r() * 230} r={0.5 + r() * 1.5} fill="#fff" opacity={0.3 + r() * 0.6} />);
    const mx = v === 1 ? 82 : 218;
    els.push(
      <circle key="halo" cx={mx} cy="96" r="58" fill={accent} opacity=".16" />,
      <circle key="moon" cx={mx} cy="96" r="34" fill={accent} />,
      <circle key="moonc" cx={mx + 12} cy="88" r="30" fill={c1} opacity=".55" />,
      <circle key="rune1" cx="150" cy="190" r="128" fill="none" stroke={accent} strokeWidth="1.2" strokeDasharray="2 7" opacity=".7" />,
      <circle key="rune2" cx="150" cy="190" r="106" fill="none" stroke={accent} strokeWidth=".8" opacity=".5" />,
      <path key="m1" d="M0 300 L48 238 L92 282 L140 212 L190 276 L240 228 L300 286 L300 435 L0 435Z" fill={c2} opacity=".85" />,
      <path key="m2" d="M0 335 L60 280 L110 322 L170 262 L226 318 L300 276 L300 435 L0 435Z" fill="#0c1a22" opacity=".8" />,
      <g key="castle" fill="#071017"><rect x="126" y="190" width="28" height="26" /><rect x="120" y="178" width="12" height="38" /><rect x="148" y="170" width="12" height="46" /><polygon points="118,178 126,160 134,178" /><polygon points="146,170 154,148 162,170" /><rect x="134" y="198" width="3" height="5" fill={accent} /><rect x="152" y="184" width="3" height="5" fill={accent} /></g>,
      <path key="m3" d="M0 372 L70 326 L130 362 L200 316 L300 368 L300 435 L0 435Z" fill="#050b10" />,
    );
  }

  return <svg className={className} viewBox="0 0 300 435" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset=".55" stopColor={c2} /><stop offset="1" stopColor={kind === "fantasy" ? "#070d14" : "#0a0a12"} /></linearGradient>
      <pattern id={`dots-${v}`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill="#fff" /></pattern>
    </defs>
    <rect width="300" height="435" fill={`url(#${gid})`} />
    {els}
  </svg>;
}