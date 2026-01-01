import { useState, useEffect, useRef, useCallback } from "react";
import Peer, { type DataConnection } from "peerjs";
import { v4 as uuidv4 } from "uuid";

export type WarpState<T> = {
  data: T;
  isConnected: boolean;
  peerId: string | null;
  connectionId: string | null;
  error: string | null;
};

export type WarpOptions = {
  initialSessionId?: string;
  onSync?: (data: any) => void;
};

type SyncMessage<T> = {
  type: "SYNC";
  payload: T;
};

export function useStateWarp<T>(initialData: T, options: WarpOptions = {}) {
  const [warpState, setWarpState] = useState<WarpState<T>>({
    data: initialData,
    isConnected: false,
    peerId: null,
    connectionId: null,
    error: null,
  });

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  const isHost = !options.initialSessionId;

  useEffect(() => {
    let peer: Peer;
    if (isHost) {
      peer = new Peer(uuidv4());
    } else {
      peer = new Peer();
    }

    peerRef.current = peer;

    peer.on("open", (id) => {
      setWarpState((prev) => ({ ...prev, peerId: id }));

      if (!isHost && options.initialSessionId) {
        connectToHost(options.initialSessionId);
      }
    });

    peer.on("connection", (conn) => {
      handleConnection(conn);
    });

    peer.on("error", (err) => {
      console.error("Warp Error:", err);
      setWarpState((prev) => ({ ...prev, error: err.message }));
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const handleConnection = useCallback(
    (conn: DataConnection) => {
      connRef.current = conn;

      conn.on("open", () => {
        setWarpState((prev) => ({
          ...prev,
          isConnected: true,
          connectionId: conn.peer,
        }));

        if (isHost) {
          conn.send({ type: "SYNC", payload: initialData } as SyncMessage<T>);
        }
      });

      conn.on("data", (data) => {
        const msg = data as SyncMessage<T>;
        if (msg?.type === "SYNC") {
          setWarpState((prev) => ({ ...prev, data: msg.payload }));
          if (options.onSync) options.onSync(msg.payload);
        }
      });

      conn.on("close", () => {
        setWarpState((prev) => ({
          ...prev,
          isConnected: false,
          connectionId: null,
        }));
      });
    },
    [isHost, initialData, options]
  );

  const connectToHost = (hostId: string) => {
    if (!peerRef.current) return;
    const conn = peerRef.current.connect(hostId);
    handleConnection(conn);
  };

  const send = useCallback((newData: T) => {
    setWarpState((prev) => ({ ...prev, data: newData }));

    if (connRef.current && connRef.current.open) {
      connRef.current.send({
        type: "SYNC",
        payload: newData,
      } as SyncMessage<T>);
    }
  }, []);

  const connectionLink =
    isHost && warpState.peerId
      ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?warp_id=${warpState.peerId}`
      : null;

  return {
    ...warpState,
    send,
    connectionLink,
    isHost,
  };
}
