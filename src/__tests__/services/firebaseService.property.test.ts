import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * **Validates: Requirements 16.5**
 *
 * Property 5: Request Deduplication
 * For any (functionName, params) pair, at most one Firestore request is in-flight
 * within a 5-second window. After 5 seconds elapse, a new request is permitted.
 */

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

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

interface ServiceCall {
  fn: 'getMenuItems' | 'createUser' | 'placeOrder' | 'getOrderStatus';
  params: unknown[];
}

function generateRandomParams(random: () => number): {
  restaurantNames: string[];
  userNames: string[];
  phones: string[];
  orderIds: string[];
} {
  const restaurantNames = Array.from(
    { length: 5 },
    (_, i) => `restaurant-${Math.floor(random() * 1000)}-${i}`
  );
  const userNames = Array.from(
    { length: 5 },
    (_, i) => `user-${Math.floor(random() * 1000)}-${i}`
  );
  const phones = Array.from({ length: 5 }, () =>
    String(Math.floor(random() * 9000000000) + 1000000000)
  );
  const orderIds = Array.from(
    { length: 5 },
    (_, i) => `order-${Math.floor(random() * 1000)}-${i}`
  );
  return { restaurantNames, userNames, phones, orderIds };
}

function generateServiceCall(
  random: () => number,
  params: ReturnType<typeof generateRandomParams>
): ServiceCall {
  const fnIndex = Math.floor(random() * 4);
  switch (fnIndex) {
    case 0: {
      const rIdx = Math.floor(random() * params.restaurantNames.length);
      return { fn: 'getMenuItems', params: [params.restaurantNames[rIdx]] };
    }
    case 1: {
      const nIdx = Math.floor(random() * params.userNames.length);
      const pIdx = Math.floor(random() * params.phones.length);
      const rIdx = Math.floor(random() * params.restaurantNames.length);
      return {
        fn: 'createUser',
        params: [params.userNames[nIdx], params.phones[pIdx], params.restaurantNames[rIdx]],
      };
    }
    case 2: {
      const rIdx = Math.floor(random() * params.restaurantNames.length);
      return {
        fn: 'placeOrder',
        params: [
          {
            userId: `uid-${Math.floor(random() * 100)}`,
            restaurantName: params.restaurantNames[rIdx],
            items: [],
            status: 'pending' as const,
            totalPrice: Math.floor(random() * 5000),
          },
        ],
      };
    }
    case 3:
    default: {
      const oIdx = Math.floor(random() * params.orderIds.length);
      return { fn: 'getOrderStatus', params: [params.orderIds[oIdx]] };
    }
  }
}

function setupMocks() {
  mockGetDocs.mockResolvedValue({
    docs: [{ id: 'item-1', data: () => ({ name: 'Test Item', price: 100 }) }],
  });
  mockAddDoc.mockResolvedValue({ id: 'new-doc-id' });
  mockGetDoc.mockResolvedValue({
    exists: () => true,
    id: 'order-id',
    data: () => ({
      userId: 'user-1',
      restaurantName: 'test-restaurant',
      items: [],
      status: 'confirmed',
      createdAt: { toDate: () => new Date() },
      totalPrice: 100,
    }),
  });
}

function getUnderlyingMockForFn(fn: ServiceCall['fn']) {
  switch (fn) {
    case 'getMenuItems':
      return mockGetDocs;
    case 'createUser':
      return mockAddDoc;
    case 'placeOrder':
      return mockAddDoc;
    case 'getOrderStatus':
      return mockGetDoc;
  }
}

async function executeServiceCall(
  service: typeof import('@/services/firebaseService').firebaseService,
  call: ServiceCall
) {
  switch (call.fn) {
    case 'getMenuItems':
      return service.getMenuItems(call.params[0] as string);
    case 'createUser':
      return service.createUser(
        call.params[0] as string,
        call.params[1] as string,
        call.params[2] as string
      );
    case 'placeOrder':
      return service.placeOrder(call.params[0] as any);
    case 'getOrderStatus':
      return service.getOrderStatus(call.params[0] as string);
  }
}

function createDeduplicationKey(fn: string, params: unknown[]): string {
  return `${fn}:${JSON.stringify(params)}`;
}

describe('firebaseService - Property: Request Deduplication', () => {
  let firebaseService: typeof import('@/services/firebaseService').firebaseService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    setupMocks();
    // Re-import to get a fresh module with cleared dedup cache
    vi.resetModules();

    // Re-apply mocks after resetModules
    vi.doMock('firebase/firestore', () => ({
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
    vi.doMock('@/services/firebase', () => ({
      db: { _mock: true },
      app: { _mock: true },
    }));
    vi.doMock('@/services/logger', () => ({
      logError: vi.fn(),
      logWarn: vi.fn(),
      logInfo: vi.fn(),
    }));

    const mod = await import('@/services/firebaseService');
    firebaseService = mod.firebaseService;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should make at most one Firestore call per unique (fn, params) within 5 seconds across 50 random iterations', async () => {
    for (let seed = 1; seed <= 50; seed++) {
      vi.clearAllMocks();
      setupMocks();

      const random = seededRandom(seed);
      const params = generateRandomParams(random);

      // Generate a random service call
      const call = generateServiceCall(random, params);

      // Call the same function with same params multiple times (2-5 times)
      const repeatCount = Math.floor(random() * 4) + 2;
      const results = [];

      for (let i = 0; i < repeatCount; i++) {
        results.push(await executeServiceCall(firebaseService, call));
      }

      // Assert: the underlying Firestore mock was only called ONCE
      const mock = getUnderlyingMockForFn(call.fn);
      expect(mock).toHaveBeenCalledTimes(1);

      // Assert: all results are identical (same cached response)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toStrictEqual(results[0]);
      }
    }
  });

  it('should allow a new Firestore call after 5 seconds elapse across 50 random iterations', async () => {
    for (let seed = 100; seed <= 149; seed++) {
      vi.clearAllMocks();
      setupMocks();

      const random = seededRandom(seed);
      const params = generateRandomParams(random);
      const call = generateServiceCall(random, params);

      // First call within the window
      await executeServiceCall(firebaseService, call);
      const mock = getUnderlyingMockForFn(call.fn);
      expect(mock).toHaveBeenCalledTimes(1);

      // Advance time past the 5-second dedup window
      vi.advanceTimersByTime(5_001);

      // Second call after window expired should make a new request
      await executeServiceCall(firebaseService, call);
      expect(mock).toHaveBeenCalledTimes(2);
    }
  });

  it('should not deduplicate calls with different parameters across 50 random iterations', async () => {
    for (let seed = 200; seed <= 249; seed++) {
      vi.clearAllMocks();
      setupMocks();

      const random = seededRandom(seed);
      const params = generateRandomParams(random);

      // Generate two different calls to the same function
      const call1 = generateServiceCall(random, params);
      let call2 = generateServiceCall(random, params);

      // Ensure call2 uses same function type but with different params
      call2 = { ...call2, fn: call1.fn };
      if (call1.fn === 'getMenuItems') {
        // Use a different restaurant name
        call2 = {
          fn: 'getMenuItems',
          params: [`different-restaurant-${seed}`],
        };
      } else if (call1.fn === 'createUser') {
        call2 = {
          fn: 'createUser',
          params: [`different-user-${seed}`, '9999999999', `different-rest-${seed}`],
        };
      } else if (call1.fn === 'placeOrder') {
        call2 = {
          fn: 'placeOrder',
          params: [
            {
              userId: `different-uid-${seed}`,
              restaurantName: `different-rest-${seed}`,
              items: [],
              status: 'pending' as const,
              totalPrice: seed * 10,
            },
          ],
        };
      } else {
        call2 = {
          fn: 'getOrderStatus',
          params: [`different-order-${seed}`],
        };
      }

      // Ensure the dedup keys are actually different
      const key1 = createDeduplicationKey(call1.fn, call1.params);
      const key2 = createDeduplicationKey(call2.fn, call2.params);

      if (key1 === key2) {
        // Skip this iteration if params happen to match (unlikely but possible)
        continue;
      }

      await executeServiceCall(firebaseService, call1);
      await executeServiceCall(firebaseService, call2);

      // Both calls should result in separate Firestore requests
      const mock = getUnderlyingMockForFn(call1.fn);
      expect(mock).toHaveBeenCalledTimes(2);
    }
  });

  it('should deduplicate across all four service functions with random params', async () => {
    const fns: ServiceCall['fn'][] = ['getMenuItems', 'createUser', 'placeOrder', 'getOrderStatus'];

    for (let seed = 300; seed <= 349; seed++) {
      vi.clearAllMocks();
      setupMocks();

      const random = seededRandom(seed);
      const fnIndex = Math.floor(random() * fns.length);
      const fn = fns[fnIndex];

      let call: ServiceCall;
      switch (fn) {
        case 'getMenuItems':
          call = { fn, params: [`rest-${seed}`] };
          break;
        case 'createUser':
          call = { fn, params: [`name-${seed}`, `${1000000000 + seed}`, `rest-${seed}`] };
          break;
        case 'placeOrder':
          call = {
            fn,
            params: [
              {
                userId: `uid-${seed}`,
                restaurantName: `rest-${seed}`,
                items: [],
                status: 'pending' as const,
                totalPrice: seed,
              },
            ],
          };
          break;
        case 'getOrderStatus':
          call = { fn, params: [`order-${seed}`] };
          break;
      }

      // Call 3 times within window
      const r1 = await executeServiceCall(firebaseService, call);
      const r2 = await executeServiceCall(firebaseService, call);
      const r3 = await executeServiceCall(firebaseService, call);

      // Only one underlying call
      const mock = getUnderlyingMockForFn(fn);
      expect(mock).toHaveBeenCalledTimes(1);

      // All return same result
      expect(r1).toStrictEqual(r2);
      expect(r2).toStrictEqual(r3);

      // Advance past 5s window
      vi.advanceTimersByTime(5_001);

      // New call should trigger a fresh request
      await executeServiceCall(firebaseService, call);
      expect(mock).toHaveBeenCalledTimes(2);
    }
  });

  it('should handle concurrent requests to same (fn, params) - only one Firestore call', async () => {
    for (let seed = 400; seed <= 424; seed++) {
      vi.clearAllMocks();
      setupMocks();

      const random = seededRandom(seed);
      const params = generateRandomParams(random);
      const call = generateServiceCall(random, params);

      // Fire multiple concurrent requests (without awaiting individually)
      const concurrentCount = Math.floor(random() * 5) + 2;
      const promises = Array.from({ length: concurrentCount }, () =>
        executeServiceCall(firebaseService, call)
      );

      const results = await Promise.all(promises);

      // Only one actual Firestore request should have been made
      const mock = getUnderlyingMockForFn(call.fn);
      expect(mock).toHaveBeenCalledTimes(1);

      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toStrictEqual(results[0]);
      }
    }
  });
});
