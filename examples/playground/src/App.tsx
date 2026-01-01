import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useStateWarp } from "react-state-warp";
import "./App.css";

function App() {
  // 1. بررسی کن آیا در URL آیدی وجود دارد؟ (برای تشخیص موبایل)
  const [sessionId, setSessionId] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("warp_id");
    if (id) setSessionId(id);
  }, []);

  // 2. فراخوانی هوک جادویی
  const { data, send, connectionLink, isConnected, peerId, isHost } =
    useStateWarp(
      { text: "", count: 0 }, // وضعیت اولیه
      { initialSessionId: sessionId } // اگر آیدی باشد، کلاینت می‌شود
    );

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 20,
        textAlign: "center",
      }}
    >
      <h1>⚡ React State Warp Demo</h1>

      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
        <h3>Mode: {isHost ? "💻 Host (Desktop)" : "📱 Client (Mobile)"}</h3>
        <p>
          Status:{" "}
          <strong>{isConnected ? "🟢 Connected" : "🔴 Waiting..."}</strong>
        </p>

        <textarea
          style={{ width: "100%", height: 100, fontSize: 18 }}
          value={data.text}
          onChange={(e) => send({ ...data, text: e.target.value })}
          placeholder="Start typing here..."
        />

        <div style={{ marginTop: 20 }}>
          <button onClick={() => send({ ...data, count: data.count + 1 })}>
            Count is: {data.count}
          </button>
        </div>

        {/* فقط هاست باید QR کد را نشان دهد و وقتی وصل شد مخفی کند */}
        {isHost && connectionLink && !isConnected && (
          <div style={{ marginTop: 40 }}>
            <p>Scan with your phone to teleport state:</p>
            <div
              style={{
                background: "white",
                padding: 16,
                display: "inline-block",
              }}
            >
              <QRCode value={connectionLink} />
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 50, fontSize: 12, color: "#888" }}>ID: {peerId}</p>
    </div>
  );
}

export default App;
