import { useMemo } from 'react';
import { useInventoryStore } from '../stores/inventoryStore';
import type { InventoryItem } from '../types';

interface ExpiryGroup {
  urgent: InventoryItem[]; // 0-3 days
  warning: InventoryItem[]; // 4-7 days
  upcoming: InventoryItem[]; // 8-14 days
}

interface UseExpiryReturn {
  expiryGroups: ExpiryGroup;
  urgentCount: number;
  warningCount: number;
  hasUrgentItems: boolean;
  getExpiryStatus: (item: InventoryItem) => 'urgent' | 'warning' | 'upcoming' | 'safe' | 'none';
  getDaysUntilExpiry: (item: InventoryItem) => number | null;
}

export function useExpiry(): UseExpiryReturn {
  const { items } = useInventoryStore();

  const getDaysUntilExpiry = (item: InventoryItem): number | null => {
    if (!item.expiryDate) return null;
    const now = new Date();
    const expiry = new Date(item.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (item: InventoryItem): 'urgent' | 'warning' | 'upcoming' | 'safe' | 'none' => {
    const days = getDaysUntilExpiry(item);
    if (days === null) return 'none';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    if (days <= 14) return 'upcoming';
    return 'safe';
  };

  const expiryGroups = useMemo<ExpiryGroup>(() => {
    const urgent: InventoryItem[] = [];
    const warning: InventoryItem[] = [];
    const upcoming: InventoryItem[] = [];

    items.forEach((item) => {
      const status = getExpiryStatus(item);
      if (status === 'urgent') urgent.push(item);
      else if (status === 'warning') warning.push(item);
      else if (status === 'upcoming') upcoming.push(item);
    });

    // Sort by expiry date
    const sortByExpiry = (a: InventoryItem, b: InventoryItem) => {
      const daysA = getDaysUntilExpiry(a) ?? Infinity;
      const daysB = getDaysUntilExpiry(b) ?? Infinity;
      return daysA - daysB;
    };

    return {
      urgent: urgent.sort(sortByExpiry),
      warning: warning.sort(sortByExpiry),
      upcoming: upcoming.sort(sortByExpiry),
    };
  }, [items]);

  return {
    expiryGroups,
    urgentCount: expiryGroups.urgent.length,
    warningCount: expiryGroups.warning.length,
    hasUrgentItems: expiryGroups.urgent.length > 0,
    getExpiryStatus,
    getDaysUntilExpiry,
  };
}
