import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import QRCode from 'react-qr-code';
import { useStateWarp } from 'react-state-warp';
import './App.css';

type UserProfile = {
  firstName: string;
  lastName: string;
  bio: string;
  avatar: any;
  isVerified: boolean;
};

const INITIAL_STATE: UserProfile = {
  firstName: '',
  lastName: '',
  bio: '',
  avatar: null,
  isVerified: false,
};

function App() {
  const sessionId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('warp_id') || undefined;
  }, []);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, send, status, connectionLink, isHost, error, peerId } = useStateWarp<UserProfile>(
    INITIAL_STATE,
    { initialSessionId: sessionId }
  );

  useEffect(() => {
    const file = data.avatar as any;
    if (file && (file instanceof Blob || file instanceof File)) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setAvatarPreview(null);
  }, [data.avatar]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    send({ ...data, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      send({ ...data, avatar: e.target.files[0] });
    }
  };

  const handleVerify = () => {
    if (!data.firstName || !data.lastName) {
      alert("Please fill in your name first.");
      return;
    }
    send({ ...data, isVerified: true });
  };

  const handleReset = () => {
    send(INITIAL_STATE);
  };

  const copyLink = async () => {
    if (connectionLink) {
      try {
        await navigator.clipboard.writeText(connectionLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isEnabled = isHost || status === 'CONNECTED';

  if (data.isVerified) {
    return (
      <div className="layout">
        <div className="card success-card">
          <div className="success-icon">🎉</div>
          <h1 className="title">Verification Complete!</h1>
          <p className="subtitle">
            The data has been successfully synced and verified on both devices.
          </p>

          <div className="summary-box">
            <div className="summary-row">
              <span>User:</span>
              <strong>{data.firstName} {data.lastName}</strong>
            </div>
            <div className="summary-row">
              <span>Device ID:</span>
              <code>{peerId?.substring(0, 6)}</code>
            </div>
            <div className="summary-status">
              ✅ Verified Securely
            </div>
          </div>

          <button onClick={handleReset} className="btn-secondary">
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <main className="card">
        <header className="header">
          <div className="badges">
            <span className={`status-pill ${status.toLowerCase()}`}>
              <span className="dot" /> {status}
            </span>
            <span className="role-pill">
              {isHost ? 'DESKTOP' : 'MOBILE'}
            </span>
          </div>
          <h1 className="title">Identity Verification</h1>
          <p className="subtitle">Complete the form to verify your session.</p>
        </header>

        {error && <div className="error-alert">{error}</div>}

        {!isHost && status === 'CONNECTING' && (
          <div className="loader">Syncing with Host...</div>
        )}

        <div className="form-grid">
          <div className="input-group">
            <label>First Name</label>
            <input
              name="firstName"
              value={data.firstName}
              onChange={handleInputChange}
              disabled={!isEnabled}
              placeholder="Jane"
            />
          </div>

          <div className="input-group">
            <label>Last Name</label>
            <input
              name="lastName"
              value={data.lastName}
              onChange={handleInputChange}
              disabled={!isEnabled}
              placeholder="Doe"
            />
          </div>

          <div className="input-group full-width">
            <label>Bio (Optional)</label>
            <textarea
              name="bio"
              value={data.bio}
              onChange={handleInputChange}
              disabled={!isEnabled}
              placeholder="Short bio..."
              rows={2}
            />
          </div>

          <div className="input-group full-width">
            <label>Upload ID / Photo</label>
            <div className={`file-dropzone ${!isEnabled ? 'disabled' : ''}`}>
              {avatarPreview ? (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar" />
                  <div className="overlay">Change Photo</div>
                </div>
              ) : (
                <div className="placeholder">
                  <span>Tap to Upload</span>
                  <small>JPG, PNG</small>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!isEnabled}
              />
            </div>
          </div>
        </div>

        <div className="action-area">
          <button
            className="btn-primary"
            onClick={handleVerify}
            disabled={!isEnabled || !data.firstName}
          >
            Verify & Sync Data ✨
          </button>
        </div>

        {isHost && connectionLink && !data.isVerified && (
          <div className={`qr-container ${status === 'CONNECTED' ? 'minimized' : ''}`}>
            <div className="qr-frame">
              <QRCode
                value={connectionLink}
                size={120}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
            <div className="qr-content">
              <h3>Switch to Mobile</h3>
              <p>Scan to upload photo from phone</p>
              <button onClick={copyLink} className="btn-copy">
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;