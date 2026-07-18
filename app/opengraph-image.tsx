import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Atomic Pathshala — Free Biology Strategy & Roadmap Session";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: "2px solid #8A7128",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "2px solid #D4AF37",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            color: "#D4AF37",
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          ATOMIC PATHSHALA
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            color: "#FAFAF8",
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.15,
          }}
        >
          Free Biology Strategy &amp; Roadmap Session
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#B8B6B0",
            marginTop: 28,
          }}
        >
          Live on Google Meet · NEET Biology
        </div>
      </div>
    ),
    { ...size }
  );
}
