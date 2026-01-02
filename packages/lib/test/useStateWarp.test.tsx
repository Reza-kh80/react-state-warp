import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStateWarp } from '../src/useStateWarp';

// 1. تعریف متغیرهای کمکی Hoisted
const mocks = vi.hoisted(() => ({
    send: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
}));

// 2. ماک کردن UUID برای جلوگیری از تولید ID تصادفی در تست‌ها
vi.mock('uuid', () => ({
    v4: () => 'mock-peer-id' // همیشه این مقدار را برمی‌گرداند
}));

// 3. ماک کردن PeerJS
vi.mock('peerjs', () => {
    class MockConnection {
        open = true;
        peer = 'remote-peer-id';
        callbacks: Record<string, Function> = {};

        on = vi.fn().mockImplementation((event, callback) => {
            this.callbacks[event] = callback;
            if (event === 'open') {
                setTimeout(() => callback(), 10);
            }
        });

        send = mocks.send;

        trigger(event: string, data?: any) {
            if (this.callbacks[event]) {
                this.callbacks[event](data);
            }
        }
    }

    class MockPeer {
        id: string;
        callbacks: Record<string, Function> = {};

        constructor(id?: string) {
            // اگر ID پاس داده شد (مثل Host که از uuid استفاده میکند) همان را بگذار
            // اگر نه (مثل Client) مقدار پیش‌فرض بگذار
            this.id = id || 'client-generated-id';

            setTimeout(() => {
                this.trigger('open', this.id);
            }, 10);
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
            if (this.callbacks[event]) {
                this.callbacks[event](data);
            }
        }
    }

    return {
        default: MockPeer,
        MockConnection
    };
});

describe('useStateWarp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with IDLE status for host', async () => {
        const { result } = renderHook(() => useStateWarp({ count: 0 }));

        expect(result.current.status).toBe('CONNECTING');

        // حالا چون uuid ماک شده، مقدارش دقیقاً 'mock-peer-id' خواهد بود
        await waitFor(() => expect(result.current.peerId).toBe('mock-peer-id'));

        expect(result.current.isHost).toBe(true);
        expect(result.current.status).toBe('IDLE');
    });

    it('should connect to host when sessionId is provided', async () => {
        const { result } = renderHook(() => useStateWarp({ count: 0 }, { initialSessionId: 'host-id' }));

        expect(result.current.isHost).toBe(false);
        await waitFor(() => expect(mocks.connect).toHaveBeenCalledWith('host-id'));
    });

    it('should serialize and send data correctly', async () => {
        const { result } = renderHook(() => useStateWarp({ text: 'hello' }));

        await waitFor(() => expect(result.current.peerId).toBeTruthy());

        const connectionHandler = mocks.on.mock.calls.find(call => call[0] === 'connection')?.[1];
        expect(connectionHandler).toBeDefined();

        const fakeConn = {
            open: true,
            peer: 'client-id',
            on: vi.fn((evt, cb) => {
                if (evt === 'open') cb();
            }),
            send: mocks.send,
        };

        act(() => {
            connectionHandler(fakeConn);
        });

        await waitFor(() => expect(result.current.status).toBe('CONNECTED'));

        await act(async () => {
            await result.current.send({ text: 'world' });
        });

        expect(mocks.send).toHaveBeenCalled();
        const sentData = mocks.send.mock.lastCall?.[0];

        expect(sentData).toMatchObject({
            type: 'SYNC',
            payload: { text: 'world' }
        });
    });

    it('should handle File serialization', async () => {
        const file = new File(['foo'], 'foo.txt', { type: 'text/plain' });
        const { result } = renderHook(() => useStateWarp({ file: null as any }));

        await waitFor(() => expect(result.current.peerId).toBeTruthy());
        const connectionHandler = mocks.on.mock.calls.find(call => call[0] === 'connection')?.[1];

        const fakeConn = {
            open: true,
            peer: 'client-id',
            on: vi.fn((evt, cb) => { if (evt === 'open') cb(); }),
            send: mocks.send,
        };

        act(() => {
            connectionHandler(fakeConn);
        });

        await waitFor(() => expect(result.current.status).toBe('CONNECTED'));

        await act(async () => {
            await result.current.send({ file });
        });

        expect(mocks.send).toHaveBeenCalled();
        const sentData = mocks.send.mock.lastCall?.[0];

        expect(sentData.payload.file).toHaveProperty('__type', 'blob');
        expect(sentData.payload.file).toHaveProperty('name', 'foo.txt');
        expect(typeof sentData.payload.file.content).toBe('string');
    });
});