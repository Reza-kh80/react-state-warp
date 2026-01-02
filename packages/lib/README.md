<div align="center">

# ⚡ React State Warp

**Teleport your React state between devices instantly.**<br>
Move data from Desktop to Mobile (and back) without a backend, database, or login.

[![NPM Version](https://img.shields.io/npm/v/react-state-warp?color=6366f1&style=for-the-badge)](https://www.npmjs.com/package/react-state-warp)
[![License](https://img.shields.io/badge/license-MIT-blue?color=22c55e&style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Size](https://img.shields.io/bundlephobia/minzip/react-state-warp?color=f59e0b&style=for-the-badge)](https://bundlephobia.com/package/react-state-warp)

</div>

---

## 💡 Why use this?

You are building a React app and need to **transfer data** (forms, auth tokens, files) from a desktop browser to a mobile browser instantly.

* ❌ **The Old Way:** Save to DB → Log in on mobile → Fetch data → Upload file → Save → Refresh desktop.
* ✅ **The Warp Way:** Show QR Code → Scan → **Boom! State is synced.**

## ✨ Key Features

* **🌐 Zero Backend:** Powered by WebRTC (PeerJS). Data travels Device-to-Device (P2P).
* **📸 Binary Magic:** Automatically handles `File`, `Blob`, and `Uint8Array`. No manual Base64 conversion needed.
* **🛡️ Network Traversal:** Built-in Google STUN server configuration to punch through corporate firewalls and NATs.
* **🧠 Type-Safe:** Written in strict TypeScript with full definitions.
* **🎨 Headless:** You control the UI (QR code, loading states, success messages).

---

## 📦 Installation

This package requires `peerjs` as a peer dependency.

```bash
# Using pnpm (Recommended)
pnpm add react-state-warp peerjs

# Using npm
npm install react-state-warp peerjs

# Using yarn
yarn add react-state-warp peerjs
```

## 🚀 Usage
**1. Basic Text Sync**
```tsx
import { useStateWarp } from 'react-state-warp';

function App() {
  // 1. Initialize the hook
  const { data, send, connectionLink, status } = useStateWarp({ 
    text: '' 
  });

  return (
    <div>
      <h3>Status: {status}</h3>
      
      {/* 2. State updates are automatically broadcasted */}
      <input 
        value={data.text} 
        onChange={(e) => send({ ...data, text: e.target.value })} 
        placeholder="Type here to sync..."
      />

      {/* 3. Show this link (as QR) to connect another device */}
      {connectionLink && <p>Share this link: {connectionLink}</p>}
    </div>
  );
}
```
**2. File & Image Sync (Advanced)**

The library automatically detects File objects, serializes them, and reconstructs them on the receiving device.

```tsx
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
    // Just send the file object directly! 🤯
    send({ 
      ...data, 
      avatar: e.target.files[0] 
    });
  }
};
```

## 📚 API Reference

`useStateWarp<T>(initialState, options)`

**Arguments**
| Param |  Type | Description |
| :--------------------------- | :------------------------------------------- | ------------------------------------------------------------------------------ |
| `initialState` | `T` | The initial state object. |
| `options` | `WarpOptions` | Configuration object (see below). |

**Options (`WarpOptions`)**
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `initialSessionId` | `string` | `undefined` | If provided, the device acts as a Client and connects to this ID. If missing, it acts as a Host. |
| `onSync` | `(data: T) => void` | `undefined` | Callback function triggered when new data arrives from the peer. |
| `debug` | `boolean` | `false` | Enables verbose logging in the console for debugging connections. |

**Return Values**
| Property | Type | Description |
| :--- | :--- | :--- |
| `data` | `T` | The current synchronized state (Reactive). |
| `send` | `(newData: T) => void` | Function to update local state and broadcast to the peer. |
| `status` | `enum` | Connection status: `'IDLE' \| 'CONNECTING' \| 'CONNECTED' \| 'DISCONNECTED'`. |
| `isHost` | `boolean` | `true` if this device created the session (Host). |
| `connectionLink` | `string \| null` | The generated URL to share (via QR) for the client to join. |
| `peerId` | `string \| null` | The unique WebRTC ID of the current device. |
| `error` | `string \| null` | Contains error messages if connection fails. |

## 🔧 How it Works
1. **Host Initialization:** The hook initializes a PeerJS session and generates a UUID.

2. **QR Handshake:** The Host displays a URL containing `?warp_id=UUID`.

3. **Client Connection:** The Client scans the QR, grabs the ID from the URL, and signals the Host via public STUN servers.

4. **P2P Tunnel:** A direct WebRTC `DataConnection` is established.

5. **State Teleport:** When you call `send()`, data is serialized (JSON + Binary), sent over the wire, and deserialized on the other side.

## 🤝 Contributing
Contributions are welcome! Please read the root ``CONTRIBUTING.md`` for details on how to set up the Monorepo for development.

## 📄 License
MIT © [Reza Kheradmand](https://github.com/Reza-kh80/)

