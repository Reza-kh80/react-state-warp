import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStateWarp } from '../src/useStateWarp';

const mocks = vi.hoisted(() => ({
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
}));

vi.mock('uuid', () => ({
    v4: () => 'mock-peer-id'
}));

vi.mock('peerjs', () => {
    class MockConnection {
        open = true;
        peer = 'remote-peer-id';
        callbacks: Record<string, Function> = {};

        on = vi.fn().mockImplementation((event, callback) => {
            this.callbacks[event] = callback;
            if (event === 'open') setTimeout(() => callback(), 10);
        });

        send = mocks.send;

        trigger(event: string, data?: any) {
            if (this.callbacks[event]) this.callbacks[event](data);
        }
    }

    class MockPeer {
        id: string;
        callbacks: Record<string, Function> = {};

        constructor(id?: string, options?: any) {
            this.id = id || 'client-auto-id';
            setTimeout(() => this.trigger('open', this.id), 10);
        }

        on = mocks.on.mockImplementation((event, callback) => {
            this.callbacks[event] = callback;
        });

        connect = mocks.connect.mockImplementation(() => {
            const conn = new MockConnection();
            setTimeout(() => conn.trigger('open'), 10);
            return conn;
        });

        destroy = mocks.destroy;

        trigger(event: string, data?: any) {
            if (this.callbacks[event]) this.callbacks[event](data);
        }
    }

    return { default: MockPeer, MockConnection };
});

describe('useStateWarp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with IDLE status for host', async () => {
        const { result } = renderHook(() => useStateWarp({ count: 0 }));
        await waitFor(() => expect(result.current.peerId).toBe('mock-peer-id'));
        expect(result.current.isHost).toBe(true);
        expect(result.current.status).toBe('IDLE');
    });

    it('should connect to host when sessionId is provided', async () => {
        const { result } = renderHook(() => useStateWarp({ count: 0 }, { initialSessionId: 'host-id' }));
        expect(result.current.isHost).toBe(false);
        await waitFor(() => expect(mocks.connect).toHaveBeenCalledWith('host-id', expect.anything()));
    });

    it('should handle data sending', async () => {
        const { result } = renderHook(() => useStateWarp({ text: 'hi' }));

        await waitFor(() => expect(result.current.peerId).toBeTruthy());
        const connectionHandler = mocks.on.mock.calls.find(c => c[0] === 'connection')?.[1];

        const fakeConn = {
            open: true,
            peer: 'client',
            on: vi.fn((e, cb) => e === 'open' && cb()),
            send: mocks.send
        };

        act(() => connectionHandler(fakeConn));
        await waitFor(() => expect(result.current.status).toBe('CONNECTED'));

        await act(async () => {
            await result.current.send({ text: 'bye' });
        });

        expect(mocks.send).toHaveBeenCalled();
    });
});