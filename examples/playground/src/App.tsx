import { useEffect, useState, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { useStateWarp } from 'react-state-warp';
import './App.css';

type AppState = {
  text: string;
  file: File | null;
};

function App() {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('warp_id');
    if (id) setSessionId(id);
  }, []);

  const { data, send, status, connectionLink, isHost, error, peerId } = useStateWarp<AppState>(
    { text: '', file: null },
    { initialSessionId: sessionId }
  );

  useEffect(() => {
    if (data.file instanceof Blob || data.file instanceof File) {
      const url = URL.createObjectURL(data.file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [data.file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      send({ ...data, file: e.target.files[0] });
    }
  };

  const statusColor = useMemo(() => {
    switch (status) {
      case 'CONNECTED': return '#10b981';
      case 'CONNECTING': return '#f59e0b';
      case 'DISCONNECTED': return '#ef4444';
      default: return '#6b7280';
    }
  }, [status]);

  return (
    <div className="container">
      <header>
        <h1>⚡ React State Warp</h1>
        <div className="badge" style={{ backgroundColor: isHost ? '#3b82f6' : '#8b5cf6' }}>
          {isHost ? 'HOST (Desktop)' : 'CLIENT (Mobile)'}
        </div>
      </header>

      <div className="card">
        <div className="status-bar">
          <span className="status-dot" style={{ backgroundColor: statusColor }} />
          <span className="status-text">{status}</span>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="input-group">
          <label>Shared Text</label>
          <textarea
            value={data.text}
            onChange={(e) => send({ ...data, text: e.target.value })}
            placeholder="Type something to sync..."
          />
        </div>

        <div className="input-group">
          <label>Shared File (Image)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {previewUrl && (
          <div className="preview-box">
            <p>Synced Image Preview:</p>
            <img src={previewUrl} alt="Synced" />
          </div>
        )}

        {isHost && connectionLink && status !== 'CONNECTED' && (
          <div className="qr-section">
            <p>Scan to Teleport State:</p>
            <div className="qr-code">
              <QRCode value={connectionLink} size={180} />
            </div>
            <p className="device-id">ID: {peerId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;