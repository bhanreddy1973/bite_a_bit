import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to ensure mock functions are available when vi.mock factory runs
const {
  mockGetDocs,
  mockAddDoc,
  mockGetDoc,
  mockDoc,
  mockCollection,
  mockQuery,
  mockWhere,
  mockServerTimestamp,
} = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockAddDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockDoc: vi.fn((_db: unknown, collectionName: string, id: string) => ({
    _path: `${collectionName}/${id}`,
  })),
  mockCollection: vi.fn((_db: unknown, name: string) => ({
    _collectionPath: name,
  })),
  mockQuery: vi.fn((...args: unknown[]) => ({ _query: args })),
  mockWhere: vi.fn((...args: unknown[]) => ({ _where: args })),
  mockServerTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
}));

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  getDocs: mockGetDocs,
  addDoc: mockAddDoc,
  getDoc: mockGetDoc,
  doc: mockDoc,
  query: mockQuery,
  where: mockWhere,
  serverTimestamp: mockServerTimestamp,
  getFirestore: vi.fn(() => ({})),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('@/services/firebase', () => ({
  db: { _mock: true },
  app: { _mock: true },
}));

vi.mock('@/services/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
}));

import { firebaseService, IFirebaseService } from '@/services/firebaseService';

describe('firebaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exports a singleton implementing IFirebaseService', () => {
    expect(firebaseService).toBeDefined();
    expect(firebaseService.getMenuItems).toBeInstanceOf(Function);
    expect(firebaseService.createUser).toBeInstanceOf(Function);
    expect(firebaseService.placeOrder).toBeInstanceOf(Function);
    expect(firebaseService.getOrderStatus).toBeInstanceOf(Function);
  });

  describe('getMenuItems', () => {
    it('returns menu items on success', async () => {
      const mockItems = [
        { id: '1', name: 'Burger', price: 10 },
        { id: '2', name: 'Pizza', price: 15 },
      ];
      mockGetDocs.mockResolvedValue({
        docs: mockItems.map((item) => ({
          id: item.id,
          data: () => ({ name: item.name, price: item.price }),
        })),
      });

      const result = await firebaseService.getMenuItems('test-restaurant');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({ id: '1', name: 'Burger', price: 10 });
      }
    });

    it('returns network error for unavailable Firestore error', async () => {
      const error = new Error('Network unavailable') as any;
      error.code = 'unavailable';
      mockGetDocs.mockRejectedValue(error);

      const result = await firebaseService.getMenuItems('test-restaurant-net');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('network');
        expect(result.error.message).not.toContain('unavailable');
        expect(result.error.message).toContain('network');
      }
    });

    it('returns permission error for permission-denied Firestore error', async () => {
      const error = new Error('Permission denied') as any;
      error.code = 'permission-denied';
      mockGetDocs.mockRejectedValue(error);

      const result = await firebaseService.getMenuItems('test-restaurant-perm');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('permission');
      }
    });

    it('returns timeout error when operation exceeds 10 seconds', async () => {
      mockGetDocs.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 15_000))
      );

      const resultPromise = firebaseService.getMenuItems('test-timeout');
      vi.advanceTimersByTime(10_001);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('timeout');
      }
    });
  });

  describe('createUser', () => {
    it('returns user session on success', async () => {
      mockAddDoc.mockResolvedValue({ id: 'user-123' });

      const result = await firebaseService.createUser(
        'John',
        '1234567890',
        'test-restaurant'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('user-123');
        expect(result.data.name).toBe('John');
        expect(result.data.phone).toBe('1234567890');
        expect(result.data.restaurantName).toBe('test-restaurant');
        expect(result.data.isAuthenticated).toBe(true);
      }
    });

    it('maps unauthenticated error to permission category', async () => {
      const error = new Error('Unauthenticated') as any;
      error.code = 'unauthenticated';
      mockAddDoc.mockRejectedValue(error);

      const result = await firebaseService.createUser(
        'John',
        '1234567890',
        'test-rest-unauth'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('permission');
      }
    });
  });

  describe('placeOrder', () => {
    it('returns orderId on success', async () => {
      mockAddDoc.mockResolvedValue({ id: 'order-456' });

      const result = await firebaseService.placeOrder({
        userId: 'user-1',
        restaurantName: 'test-restaurant',
        items: [],
        status: 'pending',
        totalPrice: 100,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.orderId).toBe('order-456');
      }
    });

    it('maps unknown error codes to unknown category', async () => {
      const error = new Error('Something went wrong') as any;
      error.code = 'internal';
      mockAddDoc.mockRejectedValue(error);

      const result = await firebaseService.placeOrder({
        userId: 'user-1',
        restaurantName: 'test-restaurant-err',
        items: [],
        status: 'pending',
        totalPrice: 100,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('unknown');
      }
    });
  });

  describe('getOrderStatus', () => {
    it('returns order data on success', async () => {
      const mockDate = new Date('2024-01-01');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'order-789',
        data: () => ({
          userId: 'user-1',
          restaurantName: 'test-restaurant',
          items: [],
          status: 'confirmed',
          createdAt: { toDate: () => mockDate },
          totalPrice: 50,
        }),
      });

      const result = await firebaseService.getOrderStatus('order-789');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('order-789');
        expect(result.data.status).toBe('confirmed');
        expect(result.data.createdAt).toEqual(mockDate);
      }
    });

    it('returns not-found error when document does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await firebaseService.getOrderStatus('nonexistent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('not-found');
      }
    });

    it('maps not-found Firestore error code correctly', async () => {
      const error = new Error('Not found') as any;
      error.code = 'not-found';
      mockGetDoc.mockRejectedValue(error);

      const result = await firebaseService.getOrderStatus('some-id');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe('not-found');
      }
    });
  });

  describe('request deduplication', () => {
    it('returns cached result for identical requests within 5 seconds', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ id: '1', data: () => ({ name: 'Item 1' }) }],
      });

      const result1 = await firebaseService.getMenuItems('same-restaurant');
      const result2 = await firebaseService.getMenuItems('same-restaurant');

      expect(result1).toStrictEqual(result2);
      // getDocs should only be called once due to deduplication
      expect(mockGetDocs).toHaveBeenCalledTimes(1);
    });

    it('makes new request after deduplication cache expires', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ id: '1', data: () => ({ name: 'Item 1' }) }],
      });

      await firebaseService.getMenuItems('restaurant-expire');
      expect(mockGetDocs).toHaveBeenCalledTimes(1);

      // Advance time past the 5s dedup window
      vi.advanceTimersByTime(5_001);

      await firebaseService.getMenuItems('restaurant-expire');
      expect(mockGetDocs).toHaveBeenCalledTimes(2);
    });

    it('does not deduplicate requests with different parameters', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ id: '1', data: () => ({ name: 'Item 1' }) }],
      });

      await firebaseService.getMenuItems('restaurant-a-diff');
      await firebaseService.getMenuItems('restaurant-b-diff');

      expect(mockGetDocs).toHaveBeenCalledTimes(2);
    });
  });

  describe('error message safety', () => {
    it('never exposes internal Firestore error messages', async () => {
      const error = new Error(
        'INTERNAL: connection refused to firestore.googleapis.com:443'
      ) as any;
      error.code = 'unavailable';
      mockGetDocs.mockRejectedValue(error);

      const result = await firebaseService.getMenuItems('test-safe');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).not.toContain('googleapis');
        expect(result.error.message).not.toContain('INTERNAL');
        expect(result.error.message).not.toContain('connection refused');
      }
    });
  });
});
