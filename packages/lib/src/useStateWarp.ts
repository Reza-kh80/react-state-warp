import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { type DataConnection, type PeerOptions } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { serializeData, deserializeData } from './serializer';

export type ConnectionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

export type WarpState<T> = {
  data: T;
  status: ConnectionStatus;
  peerId: string | null;
  error: string | null;
};

export type WarpOptions = {
  initialSessionId?: string;
  onSync?: (data: any) => void;
  debug?: boolean;
};

type PayloadWrapper = {
  type: 'SYNC';
  payload: any;
};

const PEER_CONFIG: PeerOptions = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
};

export function useStateWarp<T>(initialData: T, options: WarpOptions = {}) {
  const [warpState, setWarpState] = useState<WarpState<T>>({
    data: initialData,
    status: 'CONNECTING',
    peerId: null,
    error: null,
  });

  const latestDataRef = useRef<T>(initialData);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const isHost = !options.initialSessionId;
  const isMounted = useRef(false);

  const updateData = (newData: T) => {
    latestDataRef.current = newData;
    setWarpState(prev => ({ ...prev, data: newData }));
  };

  useEffect(() => {
    isMounted.current = true;

    latestDataRef.current = warpState.data;

    const peer = isHost
      ? new Peer(uuidv4(), PEER_CONFIG)
      : new Peer(undefined as any, PEER_CONFIG);

    peerRef.current = peer;

    peer.on('open', (id) => {
      if (!isMounted.current) return;
      console.log('✅ Peer Open. My ID:', id);

      setWarpState(prev => ({
        ...prev,
        peerId: id,
        status: isHost ? 'IDLE' : 'CONNECTING'
      }));

      if (!isHost && options.initialSessionId) {
        console.log('🔗 Client connecting to:', options.initialSessionId);
        const conn = peer.connect(options.initialSessionId, { reliable: true });
        setupConnection(conn);
      }
    });

    peer.on('connection', (conn) => {
      console.log('📩 Incoming connection from:', conn.peer);
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('❌ Peer Error:', err);
      if (err.type === 'peer-unavailable') {
        setWarpState(prev => ({ ...prev, status: 'DISCONNECTED', error: 'Host not found. Check QR code.' }));
      } else {
        setWarpState(prev => ({ ...prev, error: err.message }));
      }
    });

    return () => {
      isMounted.current = false;
      setTimeout(() => peer.destroy(), 100);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupConnection = (conn: DataConnection) => {
    connRef.current = conn;

    conn.on('open', async () => {
      console.log('🚀 Connection Established!');
      setWarpState(prev => ({ ...prev, status: 'CONNECTED', error: null }));

      if (isHost) {
        console.log('📤 Host sending CURRENT data:', latestDataRef.current);
        const { cleaned } = await serializeData(latestDataRef.current);
        conn.send({ type: 'SYNC', payload: cleaned } as PayloadWrapper);
      }
    });

    conn.on('data', (raw: any) => {
      const msg = raw as PayloadWrapper;
      if (msg?.type === 'SYNC') {
        const realData = deserializeData(msg.payload);
        updateData(realData);
        if (options.onSync) options.onSync(realData);
      }
    });

    conn.on('close', () => {
      if (isMounted.current) {
        setWarpState(prev => ({ ...prev, status: 'DISCONNECTED' }));
      }
    });

    conn.on('error', (err) => {
      console.error('Conn Error', err);
    });
  };

  const send = useCallback(async (newData: T) => {
    updateData(newData);

    if (!connRef.current || !connRef.current.open) {
      return;
    }

    try {
      const { cleaned } = await serializeData(newData);
      connRef.current.send({ type: 'SYNC', payload: cleaned } as PayloadWrapper);
    } catch (error: any) {
      console.error('Send failed:', error);
    }
  }, []);

  const connectionLink = isHost && warpState.peerId
    ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?warp_id=${warpState.peerId}`
    : null;

  return {
    ...warpState,
    isConnected: warpState.status === 'CONNECTED',
    send,
    connectionLink,
    isHost
  };
}