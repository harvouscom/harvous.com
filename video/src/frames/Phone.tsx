import React from "react";

/**
 * A phone drawn in CSS around the web app captured at phone size.
 * `iphone` is the installed app (no browser bars), `iphone-safari` and
 * `android-chrome` add the browser's own bars. Generic shapes only.
 */
export type PhoneFrame = "iphone" | "iphone-safari" | "android-chrome";

export const BEZEL = 11;
/** Status bar above the captured viewport, in viewport pixels. */
export const statusBarHeight = (variant: PhoneFrame) => (variant === "android-chrome" ? 30 : 50);
/** Browser bar below (iOS Safari) or above (Android Chrome) the page. */
const browserBarHeight = (variant: PhoneFrame) => (variant === "iphone" ? 0 : variant === "iphone-safari" ? 58 : 52);

/** Outer size for a viewport of vw × vh at scale k. */
export const phoneSize = (variant: PhoneFrame, vw: number, vh: number, k: number) => ({
  width: (vw + BEZEL * 2) * k,
  height: (vh + statusBarHeight(variant) + browserBarHeight(variant) + BEZEL * 2) * k,
});

const StatusBar: React.FC<{ variant: PhoneFrame; ink: string }> = ({ variant, ink }) => {
  const android = variant === "android-chrome";
  return (
    <div
      style={{
        height: statusBarHeight(variant),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: android ? "0 18px" : "0 30px 0 36px",
        color: ink,
        fontSize: android ? 13 : 16,
        fontWeight: 600,
        position: "relative",
      }}
    >
      <span>9:41</span>
      {android ? (
        <span style={{ position: "absolute", left: "50%", top: 8, width: 12, height: 12, marginLeft: -6, borderRadius: 6, background: "#0b0b0d" }} />
      ) : (
        <span style={{ position: "absolute", left: "50%", top: 11, width: 118, height: 33, marginLeft: -59, borderRadius: 17, background: "#0b0b0d" }} />
      )}
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="18" height="11" viewBox="0 0 18 11" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={8 - i * 2.6} width="3.2" height={3 + i * 2.6} rx="0.8" fill={ink} />
          ))}
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" fill="none" stroke={ink} strokeOpacity="0.4" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill={ink} />
          <rect x="22.6" y="4" width="1.6" height="4" rx="0.8" fill={ink} fillOpacity="0.4" />
        </svg>
      </span>
    </div>
  );
};

const SafariBar: React.FC<{ url: string }> = ({ url }) => (
  <div style={{ height: 58, display: "grid", placeItems: "center", background: "#f6f6f7", borderTop: "1px solid #e3e4e8" }}>
    <div style={{ width: "86%", height: 38, borderRadius: 19, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "grid", placeItems: "center", fontSize: 15, color: "#1f2024" }}>
      {url}
    </div>
  </div>
);

const ChromeBar: React.FC<{ url: string }> = ({ url }) => (
  <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", background: "#f1f3f4" }}>
    <div style={{ flex: 1, height: 36, borderRadius: 18, background: "#e3e5e8", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 15, color: "#1f2024" }}>
      {url}
    </div>
    <span style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid #444", fontSize: 11, display: "grid", placeItems: "center" }}>1</span>
  </div>
);

export const Phone: React.FC<{
  variant: PhoneFrame;
  /** Captured viewport size in CSS px. */
  viewport: { width: number; height: number };
  /** Stage pixels per viewport pixel. */
  scale: number;
  url?: string;
  children: React.ReactNode;
}> = ({ variant, viewport, scale, url = "app.harvous.com", children }) => {
  const { width, height } = phoneSize(variant, viewport.width, viewport.height, 1);
  const android = variant === "android-chrome";
  return (
    <div style={{ width: width * scale, height: height * scale }}>
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          padding: BEZEL,
          borderRadius: android ? 44 : 60,
          // Graphite with a lit edge, matching the browser's glass-on-paper rim.
          background: "linear-gradient(160deg, #4a4c52 0%, #1b1c20 38%, #121316 70%, #3a3c42 100%)",
          boxShadow: [
            "inset 0 0 0 1.5px rgba(255,255,255,0.18)",
            "inset 0 0 0 4px rgba(0,0,0,0.6)",
            "0 50px 100px -30px rgba(20,40,80,0.4)",
            "0 18px 40px -18px rgba(20,40,80,0.3)",
          ].join(", "),
        }}
      >
        <div
          style={{
            width: viewport.width,
            height: height - BEZEL * 2,
            borderRadius: android ? 34 : 50,
            overflow: "hidden",
            background: "#fcfcfb",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StatusBar variant={variant} ink="#0d0e12" />
          {android ? <ChromeBar url={url} /> : null}
          <div style={{ position: "relative", width: viewport.width, height: viewport.height, overflow: "hidden" }}>
            {children}
          </div>
          {variant === "iphone-safari" ? <SafariBar url={url} /> : null}
          {android ? null : (
            <span
              style={{
                position: "absolute",
                left: "50%",
                bottom: 8,
                width: 134,
                height: 5,
                marginLeft: -67,
                borderRadius: 3,
                background: "#0d0e12",
                opacity: 0.85,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
