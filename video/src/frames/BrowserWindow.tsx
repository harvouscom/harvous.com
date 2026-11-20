import React from "react";
import { Img, staticFile } from "remotion";

/**
 * A browser, stylised rather than literal: one frosted bar, a tab pill and an
 * address capsule, soft rims, generous corners. Each variant keeps the one
 * detail people recognise (traffic lights on a Mac, a centred field in
 * Safari, caption buttons on Windows) and drops the rest. No logos.
 */
export type DesktopFrame = "mac-chrome" | "mac-safari" | "windows-chrome";
export type FrameTheme = "light" | "dark";

/** Height of the bar above the page, in stage pixels. */
export const CHROME_HEIGHT = 58;

const palette = (theme: FrameTheme) =>
  theme === "dark"
    ? {
        bar: "rgba(30,31,36,0.82)",
        pill: "rgba(255,255,255,0.08)",
        pillActive: "rgba(255,255,255,0.14)",
        ink: "#eef0f4",
        faint: "rgba(238,240,244,0.5)",
        rim: "rgba(255,255,255,0.12)",
        page: "#16171a",
      }
    : {
        bar: "rgba(255,255,255,0.72)",
        pill: "rgba(13,14,18,0.045)",
        pillActive: "#ffffff",
        ink: "#1f2024",
        faint: "rgba(31,32,36,0.45)",
        rim: "rgba(255,255,255,0.9)",
        page: "#fcfcfb",
      };

type P = ReturnType<typeof palette>;

const Lights: React.FC = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#ff6a5f", "#ffc23d", "#2fcf55"].map((c) => (
      <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.1)" }} />
    ))}
  </div>
);

const Tab: React.FC<{ p: P; title: string }> = ({ p, title }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      height: 36,
      padding: "0 16px 0 10px",
      borderRadius: 12,
      background: p.pillActive,
      boxShadow: "0 1px 2px rgba(13,30,60,0.08), 0 0 0 0.5px rgba(13,30,60,0.06)",
      color: p.ink,
      fontSize: 14,
      fontWeight: 550,
    }}
  >
    <Img src={staticFile("intro/assets/icon.png")} style={{ width: 20, height: 20, borderRadius: 6 }} />
    {title}
  </div>
);

const Address: React.FC<{ p: P; url: string; center?: boolean; width?: number | string }> = ({ p, url, center, width = "100%" }) => (
  <div
    style={{
      width,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: center ? "center" : "flex-start",
      gap: 9,
      padding: "0 16px",
      borderRadius: 18,
      background: p.pill,
      color: p.ink,
      fontSize: 15,
      fontWeight: 450,
      letterSpacing: "0.005em",
    }}
  >
    <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden>
      <rect x="1" y="5.5" width="9" height="7" rx="1.8" fill={p.faint} />
      <path d="M3 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke={p.faint} strokeWidth="1.5" fill="none" />
    </svg>
    <span>{url}</span>
  </div>
);

const Caption: React.FC<{ p: P }> = ({ p }) => (
  <div style={{ display: "flex", gap: 22, alignItems: "center", paddingRight: 6 }}>
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M1 6h10" stroke={p.ink} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke={p.ink} strokeWidth="1.2" fill="none" />
    </svg>
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M2 2l8 8M10 2l-8 8" stroke={p.ink} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </div>
);

export const BrowserWindow: React.FC<{
  variant: DesktopFrame;
  theme: FrameTheme;
  width: number;
  viewportHeight: number;
  url?: string;
  title?: string;
  children: React.ReactNode;
}> = ({ variant, theme, width, viewportHeight, url = "app.harvous.com", title = "Harvous", children }) => {
  const p = palette(theme);
  const h = CHROME_HEIGHT;
  const radius = variant === "windows-chrome" ? 14 : 22;

  let bar: React.ReactNode;
  if (variant === "mac-safari") {
    bar = (
      <>
        <Lights />
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Address p={p} url={url} center width="46%" />
        </div>
        <div style={{ width: 52 }} />
      </>
    );
  } else if (variant === "windows-chrome") {
    bar = (
      <>
        <Tab p={p} title={title} />
        <div style={{ flex: 1 }}>
          <Address p={p} url={url} />
        </div>
        <Caption p={p} />
      </>
    );
  } else {
    bar = (
      <>
        <Lights />
        <Tab p={p} title={title} />
        <div style={{ flex: 1 }}>
          <Address p={p} url={url} />
        </div>
      </>
    );
  }

  return (
    <div
      style={{
        width,
        borderRadius: radius,
        overflow: "hidden",
        background: p.page,
        // A bright rim inside, a long soft shadow out: glass on paper.
        boxShadow: [
          `inset 0 0 0 1px ${p.rim}`,
          "0 0 0 1px rgba(13,30,60,0.06)",
          "0 50px 100px -30px rgba(20,40,80,0.35)",
          "0 18px 40px -18px rgba(20,40,80,0.28)",
        ].join(", "),
      }}
    >
      <div
        style={{
          height: h,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 16px 0 20px",
          background: p.bar,
          backdropFilter: "blur(18px) saturate(1.4)",
          borderBottom: "1px solid rgba(13,30,60,0.06)",
        }}
      >
        {bar}
      </div>
      <div style={{ position: "relative", width, height: viewportHeight, overflow: "hidden" }}>{children}</div>
    </div>
  );
};
