import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { type DataConnection } from 'peerjs';
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

export function useStateWarp<T>(initialData: T, options: WarpOptions = {}) {
  const [warpState, setWarpState] = useState<WarpState<T>>({
    data: initialData,
    status: 'IDLE',
    peerId: null,
    error: null,
  });

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const isHost = !options.initialSessionId;

  const updateStatus = (status: ConnectionStatus) => {
    setWarpState(prev => prev.status === status ? prev : { ...prev, status });
  };

  useEffect(() => {
    updateStatus('CONNECTING');

    const peer = isHost ? new Peer(uuidv4()) : new Peer();
    peerRef.current = peer;

    const handlePeerOpen = (id: string) => {
      setWarpState(prev => ({
        ...prev,
        peerId: id,
        status: isHost ? 'IDLE' : 'CONNECTING'
      }));

      if (!isHost && options.initialSessionId) {
        const conn = peer.connect(options.initialSessionId);
        setupConnection(conn);
      }
    };

    const handlePeerConnection = (conn: DataConnection) => {
      setupConnection(conn);
    };

    const handlePeerError = (err: any) => {
      setWarpState(prev => ({ ...prev, status: 'DISCONNECTED', error: err.message }));
    };

    peer.on('open', handlePeerOpen);
    peer.on('connection', handlePeerConnection);
    peer.on('error', handlePeerError);

    return () => {
      peer.destroy();
    };
  }, []);

  const setupConnection = (conn: DataConnection) => {
    connRef.current = conn;

    conn.on('open', async () => {
      updateStatus('CONNECTED');
      setWarpState(prev => ({ ...prev, error: null }));

      if (isHost) {
        const { cleaned } = await serializeData(initialData);
        conn.send({ type: 'SYNC', payload: cleaned } as PayloadWrapper);
      }
    });

    conn.on('data', (raw: any) => {
      const msg = raw as PayloadWrapper;
      if (msg?.type === 'SYNC') {
        const realData = deserializeData(msg.payload);
        setWarpState(prev => ({ ...prev, data: realData }));
        if (options.onSync) options.onSync(realData);
      }
    });

    conn.on('close', () => {
      updateStatus('DISCONNECTED');
    });

    conn.on('error', (err) => {
      setWarpState(prev => ({ ...prev, error: err.message }));
    });
  };

  const send = useCallback(async (newData: T) => {
    setWarpState(prev => ({ ...prev, data: newData }));

    if (connRef.current && connRef.current.open) {
      try {
        const { cleaned } = await serializeData(newData);
        connRef.current.send({ type: 'SYNC', payload: cleaned } as PayloadWrapper);
      } catch (error: any) {
        setWarpState(prev => ({ ...prev, error: error.message }));
      }
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