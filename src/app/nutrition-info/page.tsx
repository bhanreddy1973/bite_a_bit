'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useUserStore } from '@/stores/userStore';
import {
  calculateTotals,
  calculateMacroPercentages,
  getProteinRatio,
  NutritionItem,
} from '@/utils/nutrition';

const DonutChart = dynamic(() => import('@/components/ui/DonutChart'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: '50%',
        backgroundColor: 'var(--color-bg-secondary)',
      }}
    />
  ),
});

/** Shape of each item stored in localStorage under 'bite-a-bit-last-order' */
interface LastOrderItem {
  name: string;
  quantity: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface LastOrderData {
  items: LastOrderItem[];
}

const MACRO_COLORS = {
  carbs: '#007AFF',
  protein: '#34C759',
  fat: '#FF9500',
};

export default function NutritionInfoPage() {
  const router = useRouter();
  const session = useUserStore((state) => state.session);
  const [orderItems, setOrderItems] = useState<NutritionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!session?.isAuthenticated) {
      router.push('/');
    }
  }, [session, router]);

  // Load order data from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bite-a-bit-last-order');
      if (raw) {
        const data: LastOrderData = JSON.parse(raw);
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const nutritionItems: NutritionItem[] = data.items.map((item) => ({
            calories: item.calories || 0,
            carbs: item.carbs || 0,
            protein: item.protein || 0,
            fat: item.fat || 0,
            quantity: item.quantity || 1,
          }));
          setOrderItems(nutritionItems);
        }
      }
    } catch {
      // If localStorage data is corrupted, show empty state
    }
    setIsLoading(false);
  }, []);

  const totals = useMemo(() => calculateTotals(orderItems), [orderItems]);

  const percentages = useMemo(
    () => calculateMacroPercentages(totals.carbs, totals.protein, totals.fat),
    [totals],
  );

  const proteinRatio = useMemo(
    () => getProteinRatio(totals.carbs, totals.protein, totals.fat),
    [totals],
  );

  const chartSegments = useMemo(
    () => [
      { label: 'Carbs', value: totals.carbs, color: MACRO_COLORS.carbs },
      { label: 'Protein', value: totals.protein, color: MACRO_COLORS.protein },
      { label: 'Fat', value: totals.fat, color: MACRO_COLORS.fat },
    ],
    [totals],
  );

  // Don't render until auth check completes
  if (!session?.isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        <p style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family)' }}>
          Loading...
        </p>
      </div>
    );
  }

  // Empty state when no items
  if (orderItems.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-bg-primary)',
          fontFamily: 'var(--font-family)',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: 'var(--space-4)',
          }}
          aria-hidden="true"
        >
          🥗
        </div>
        <h1
          style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          No Nutrition Data
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          Place an order to see your nutritional breakdown.
        </p>
        <button
          onClick={() => router.push('/menu')}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: 'var(--space-3) var(--space-6)',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--space-6)',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Page heading */}
      <h1
        style={{
          fontSize: 'var(--font-size-heading)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
        }}
      >
        Nutrition Info
      </h1>

      {/* Donut Chart */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--space-8)',
        }}
      >
        <DonutChart
          segments={chartSegments}
          centerLabel={`${totals.calories} cal`}
          size={220}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-6)',
        }}
        aria-label="Macronutrient legend"
      >
        <LegendItem label="Carbs" percentage={percentages.carbs} color={MACRO_COLORS.carbs} />
        <LegendItem label="Protein" percentage={percentages.protein} color={MACRO_COLORS.protein} />
        <LegendItem label="Fat" percentage={percentages.fat} color={MACRO_COLORS.fat} />
      </div>

      {/* Contextual message */}
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: proteinRatio >= 0.3
            ? 'var(--color-primary-light)'
            : 'var(--color-secondary-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-primary)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: 'var(--line-height-normal)',
            margin: 0,
          }}
        >
          {proteinRatio >= 0.3
            ? '💪 Great job! Your meal has an excellent protein balance.'
            : '💡 Consider adding more protein-rich items to balance your meal.'}
        </p>
      </div>

      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: 'var(--space-3) var(--space-6)',
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

function LegendItem({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: 'var(--font-size-body)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {percentage}%
      </span>
    </div>
  );
}
