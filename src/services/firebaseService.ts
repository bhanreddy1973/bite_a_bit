import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  serverTimestamp,
  FirestoreError,
} from 'firebase/firestore';
import { db } from './firebase';
import { MenuItem } from '@/types/menu';
import { UserSession } from '@/types/user';
import { Order } from '@/types/order';
import { Result, ErrorCategory } from '@/types/common';
import { logError } from './logger';

/**
 * Interface defining all Firebase/Firestore operations.
 * Components depend on this abstraction, enabling mock substitution in tests.
 */
export interface IFirebaseService {
  getMenuItems(restaurantName: string): Promise<Result<MenuItem[]>>;
  createUser(name: string, phone: string, restaurantName: string): Promise<Result<UserSession>>;
  placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Result<{ orderId: string }>>;
  getOrderStatus(orderId: string): Promise<Result<Order>>;
}

/** Timeout duration for all Firestore operations (ms). */
const OPERATION_TIMEOUT_MS = 10_000;

/** Duration to cache deduplicated request results (ms). */
const DEDUP_CACHE_TTL_MS = 5_000;

/**
 * Entry in the deduplication cache.
 */
interface DeduplicationEntry<T = unknown> {
  promise: Promise<Result<T>>;
  timestamp: number;
}

/**
 * Map of in-flight/cached requests keyed by function name + serialized params.
 */
const deduplicationCache = new Map<string, DeduplicationEntry>();

/**
 * Creates a deduplication key from function name and parameters.
 */
function createDeduplicationKey(fn: string, params: unknown[]): string {
  return `${fn}:${JSON.stringify(params)}`;
}

/**
 * Wraps a Firestore operation with deduplication and timeout.
 * Returns cached result if an identical request was made within the TTL window.
 */
function withDeduplication<T>(
  key: string,
  operation: () => Promise<Result<T>>,
): Promise<Result<T>> {
  const cached = deduplicationCache.get(key);
  if (cached && Date.now() - cached.timestamp < DEDUP_CACHE_TTL_MS) {
    return cached.promise as Promise<Result<T>>;
  }

  const promise = operation();
  deduplicationCache.set(key, { promise, timestamp: Date.now() });

  // Clean up cache entry after TTL expires
  setTimeout(() => {
    const entry = deduplicationCache.get(key);
    if (entry && Date.now() - entry.timestamp >= DEDUP_CACHE_TTL_MS) {
      deduplicationCache.delete(key);
    }
  }, DEDUP_CACHE_TTL_MS);

  return promise;
}

/**
 * Creates a timeout promise that resolves with a timeout error after the specified duration.
 */
function createTimeoutPromise<T>(ms: number): Promise<Result<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: false,
        error: {
          category: 'timeout' as ErrorCategory,
          message: 'The operation timed out. Please try again.',
        },
      });
    }, ms);
  });
}

/**
 * Wraps a Firestore operation with a timeout using Promise.race.
 */
function withTimeout<T>(operation: Promise<Result<T>>): Promise<Result<T>> {
  return Promise.race([operation, createTimeoutPromise<T>(OPERATION_TIMEOUT_MS)]);
}

/**
 * Maps a Firestore error code to a typed ErrorCategory.
 *
 * Mapping:
 * - 'unavailable' | 'failed-precondition' → 'network'
 * - 'permission-denied' | 'unauthenticated' → 'permission'
 * - 'not-found' → 'not-found'
 * - others → 'unknown'
 */
function mapFirestoreError(error: FirestoreError): {
  category: ErrorCategory;
  message: string;
} {
  const code = error.code;

  let category: ErrorCategory;
  let message: string;

  switch (code) {
    case 'unavailable':
    case 'failed-precondition':
      category = 'network';
      message = 'A network error occurred. Please check your connection and try again.';
      break;
    case 'permission-denied':
    case 'unauthenticated':
      category = 'permission';
      message = 'You do not have permission to perform this action.';
      break;
    case 'not-found':
      category = 'not-found';
      message = 'The requested resource was not found.';
      break;
    default:
      category = 'unknown';
      message = 'An unexpected error occurred. Please try again.';
      break;
  }

  return { category, message };
}

/**
 * Maps any caught error to a typed error result.
 * Never exposes internal Firestore error details.
 */
function handleError<T>(error: unknown, context: string): Result<T> {
  if (error instanceof Error && 'code' in error) {
    const firestoreError = error as FirestoreError;
    const mapped = mapFirestoreError(firestoreError);
    logError('FIRESTORE_ERROR', mapped.message, {
      action: context,
      code: firestoreError.code,
    });
    return { success: false, error: mapped };
  }

  logError('UNKNOWN_ERROR', 'An unexpected error occurred.', {
    action: context,
  });
  return {
    success: false,
    error: {
      category: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
    },
  };
}

/**
 * Firebase service implementation.
 * All operations have a 10-second timeout and request deduplication (5s cache).
 */
class FirebaseServiceImpl implements IFirebaseService {
  async getMenuItems(restaurantName: string): Promise<Result<MenuItem[]>> {
    const key = createDeduplicationKey('getMenuItems', [restaurantName]);

    return withDeduplication(key, () => withTimeout(this._getMenuItems(restaurantName)));
  }

  async createUser(
    name: string,
    phone: string,
    restaurantName: string,
  ): Promise<Result<UserSession>> {
    const key = createDeduplicationKey('createUser', [name, phone, restaurantName]);

    return withDeduplication(key, () => withTimeout(this._createUser(name, phone, restaurantName)));
  }

  async placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Result<{ orderId: string }>> {
    const key = createDeduplicationKey('placeOrder', [order]);

    return withDeduplication(key, () => withTimeout(this._placeOrder(order)));
  }

  async getOrderStatus(orderId: string): Promise<Result<Order>> {
    const key = createDeduplicationKey('getOrderStatus', [orderId]);

    return withDeduplication(key, () => withTimeout(this._getOrderStatus(orderId)));
  }

  private async _getMenuItems(restaurantName: string): Promise<Result<MenuItem[]>> {
    try {
      const menuQuery = query(
        collection(db, 'menu_items'),
        where('restaurantName', '==', restaurantName),
      );
      const snapshot = await getDocs(menuQuery);
      const items: MenuItem[] = snapshot.docs.map(
        (docSnap) =>
          ({
            id: docSnap.id,
            ...docSnap.data(),
          }) as MenuItem,
      );

      return { success: true, data: items };
    } catch (error) {
      return handleError<MenuItem[]>(error, 'getMenuItems');
    }
  }

  private async _createUser(
    name: string,
    phone: string,
    restaurantName: string,
  ): Promise<Result<UserSession>> {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        name,
        phone,
        restaurantName,
        createdAt: serverTimestamp(),
      });

      const session: UserSession = {
        id: docRef.id,
        name,
        phone,
        restaurantName,
        isAuthenticated: true,
      };

      return { success: true, data: session };
    } catch (error) {
      return handleError<UserSession>(error, 'createUser');
    }
  }

  private async _placeOrder(
    order: Omit<Order, 'id' | 'createdAt'>,
  ): Promise<Result<{ orderId: string }>> {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
      });

      return { success: true, data: { orderId: docRef.id } };
    } catch (error) {
      return handleError<{ orderId: string }>(error, 'placeOrder');
    }
  }

  private async _getOrderStatus(orderId: string): Promise<Result<Order>> {
    try {
      const docRef = doc(db, 'orders', orderId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return {
          success: false,
          error: {
            category: 'not-found',
            message: 'The requested order was not found.',
          },
        };
      }

      const data = snapshot.data();
      const order: Order = {
        id: snapshot.id,
        userId: data.userId,
        restaurantName: data.restaurantName,
        items: data.items,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        totalPrice: data.totalPrice,
      };

      return { success: true, data: order };
    } catch (error) {
      return handleError<Order>(error, 'getOrderStatus');
    }
  }
}

/** Singleton instance of the Firebase service. */
export const firebaseService: IFirebaseService = new FirebaseServiceImpl();
