# ⚡ React State Warp

> **Teleport your React state between devices instantly.**
> Move data from Desktop to Mobile (and back) without a backend, database, or login.

![NPM Version](https://img.shields.io/npm/v/react-state-warp?color=indigo&style=flat-square)
![Tests](https://img.shields.io/github/actions/workflow/status/Reza-kh80/react-state-warp/ci.yml?branch=main&label=Tests&style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square)
![Size](https://img.shields.io/bundlephobia/minzip/react-state-warp?color=success&style=flat-square)

## 🤔 The Problem
You are building a form on a desktop web app. Suddenly, you need the user to **upload a photo from their phone** or **sign with their finger**.
Usually, this means:
1.  Asking the user to log in on mobile.
2.  Saving draft data to a database.
3.  Building complex API endpoints to sync status.

## 💡 The Solution
**React State Warp** creates a secure, peer-to-peer wormhole between devices.
1.  Generate a QR code on the host.
2.  Scan it with any device.
3.  **State is synced instantly.** Files, JSON, Text—everything.

## ✨ Features
* **Zero Backend:** Powered by WebRTC (PeerJS). Data goes Device-to-Device.
* **Binary Support:** Sync `File`, `Blob`, and `Uint8Array` seamlessly.
* **Network Traversal:** Built-in Google STUN server config to punch through firewalls/NAT.
* **Type-Safe:** Written in strict TypeScript.
* **Headless:** You control the UI (QR code, loading states, etc).

## 🚀 Quick Demo (Monorepo)

To run the full "Identity Verification" demo locally:

```bash
# 1. Clone
git clone [https://github.com/Reza-kh80/react-state-warp.git](https://github.com/Reza-kh80/react-state-warp.git)

# 2. Install
pnpm install

# 3. Run (Auto-detects network IP)
pnpm run dev
```

## 📦 Installation
```bash
npm install react-state-warp
# or
pnpm add react-state-warp
```
## 💻 Usage
```tsx
import { useStateWarp } from 'react-state-warp';

function App() {
  // 1. Initialize the hook
  const { data, send, connectionLink, status } = useStateWarp({ 
    text: '', 
    image: null 
  });

  return (
    <div>
      <h1>Status: {status}</h1>
      
      {/* 2. Update state (syncs automatically) */}
      <input 
        value={data.text} 
        onChange={(e) => send({ ...data, text: e.target.value })} 
      />

      {/* 3. Show QR Code to connect second device */}
      {connectionLink && <QRCode value={connectionLink} />}
    </div>
  );
}
```
## License
MIT License © [Reza Kheradmand](https://github.com/Reza-kh80)



