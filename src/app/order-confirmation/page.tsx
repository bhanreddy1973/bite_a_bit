'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Order, OrderItem } from '@/types/order';

const STATUS_BADGE_VARIANT: Record<OrderItem['status'], 'warning' | 'success' | 'info'> = {
  preparing: 'warning',
  ready: 'success',
  served: 'info',
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const session = useUserStore((state) => state.session);
  const [order, setOrder] = useState<Order | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Auth guard: redirect to / if not authenticated
  useEffect(() => {
    if (!session || !session.isAuthenticated) {
      router.push('/');
    }
  }, [session, router]);

  // Read order data from localStorage
  useEffect(() => {
    try {
      const storedOrder = localStorage.getItem('bite-a-bit-last-order');
      if (storedOrder) {
        const parsed = JSON.parse(storedOrder) as Order;
        setOrder(parsed);
      }
    } catch {
      // If localStorage data is corrupted, leave order as null (empty state)
    }
    setIsHydrated(true);
  }, []);

  // Don't render until hydrated to avoid flash
  if (!isHydrated) {
    return null;
  }

  // Empty state when no order data in localStorage
  if (!order || !order.items || order.items.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h1 style={styles.emptyHeading}>No Active Order</h1>
          <p style={styles.emptyText}>
            You don&apos;t have any active orders. Browse the menu to place an order.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push('/menu')}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  const estimatedPrepTime = order.items[0]?.prepTime ?? 'N/A';

  return (
    <div style={styles.container}>
      {/* Order Status Heading */}
      <header style={styles.header}>
        <h1 style={styles.heading}>Order Placed!</h1>
        <p style={styles.prepTimeLabel}>Estimated prep time</p>
        <p style={styles.prepTimeValue}>{estimatedPrepTime}</p>
      </header>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/nutrition-info')}
        >
          Check Nutrition Balance
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => router.push('/menu')}
        >
          Add More
        </Button>
      </div>

      {/* Items List */}
      <section style={styles.itemsSection}>
        <h2 style={styles.itemsHeading}>Order Items</h2>
        <div style={styles.itemsList}>
          {order.items.map((item, index) => (
            <div key={`${item.menuItemId}-${index}`} style={styles.itemCard}>
              <div style={styles.itemTop}>
                <span style={styles.itemName}>{item.name}</span>
                <Badge variant={STATUS_BADGE_VARIANT[item.status]}>
                  {item.status}
                </Badge>
              </div>
              <div style={styles.itemBottom}>
                <span style={styles.itemMeta}>Prep: {item.prepTime}</span>
                <span style={styles.itemMeta}>Added by: {item.addedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--space-6)',
    maxWidth: 'var(--max-width-mobile)',
    margin: '0 auto',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
  },
  heading: {
    fontSize: 'var(--font-size-heading)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
    marginBottom: 'var(--space-2)',
  },
  prepTimeLabel: {
    fontSize: 'var(--font-size-caption)',
    color: 'var(--color-text-tertiary)',
    margin: 0,
    marginBottom: 'var(--space-1)',
  },
  prepTimeValue: {
    fontSize: 'var(--font-size-title)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-primary)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-8)',
  },
  itemsSection: {
    marginBottom: 'var(--space-8)',
  },
  itemsHeading: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    margin: 0,
    marginBottom: 'var(--space-4)',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  itemCard: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    boxShadow: 'var(--shadow-sm)',
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-2)',
  },
  itemName: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-primary)',
  },
  itemBottom: {
    display: 'flex',
    gap: 'var(--space-4)',
    alignItems: 'center',
  },
  itemMeta: {
    fontSize: 'var(--font-size-caption)',
    color: 'var(--color-text-tertiary)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    gap: 'var(--space-4)',
  },
  emptyHeading: {
    fontSize: 'var(--font-size-heading)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  emptyText: {
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-secondary)',
    margin: 0,
    maxWidth: '280px',
  },
};
