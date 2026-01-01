# ⚡ React State Warp

**Teleport your React state between devices instantly.**
Scan a QR code on your phone, and seamlessly continue what you were doing on your desktop. Zero backend code required.

![License](https://img.shields.io/npm/l/react-state-warp)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## ✨ Features
- 🚀 **Instant Sync:** Uses WebRTC for real-time, peer-to-peer state transfer.
- 🔒 **Secure:** Data goes device-to-device, skipping the database.
- 📱 **Mobile Friendly:** Perfect for "Continue on Mobile" features.
- 📦 **Tiny:** Lightweight and tree-shakable.

## 📦 Installation

```bash
pnpm add react-state-warp
# or
npm install react-state-warp
```

## 🚀 Usage

### 1. The Host (Desktop/Sender)
```tsx
import { useStateWarp } from 'react-state-warp';
import QRCode from 'react-qr-code'; // Install a QR lib separately

function DesktopView() {
  const { data, send, connectionLink, isConnected } = useStateWarp({ text: '' });

  return (
    <div>
      <h1>Desktop View</h1>
      <textarea 
        value={data.text} 
        onChange={(e) => send({ text: e.target.value })} 
        placeholder="Type here..."
      />
      
      {/* Show QR to connect */}
      {connectionLink && !isConnected && (
        <div style={{ marginTop: 20 }}>
          <p>Scan to continue on mobile:</p>
          <QRCode value={connectionLink} />
        </div>
      )}
      
      {isConnected && <p>🟢 Device Connected!</p>}
    </div>
  );
}
```

### 2. The Client (Mobile/Receiver)
Usually, you handle this on the same page by checking the URL query params.

```tsx
// Inside your App component
const params = new URLSearchParams(window.location.search);
const warpId = params.get('warp_id');

// If warp_id exists, the hook automatically becomes a Client
const { data, send } = useStateWarp(
  { text: '' }, 
  { initialSessionId: warpId || undefined }
);
```

## 🤝 Contributing
Contributions are welcome! Please read our contributing guide.