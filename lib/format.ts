import type { Lease, LeaseStatus } from "./types";

export const NOTICE_WINDOW_DAYS = 60;

/** Days between today and `dateStr` (positive = in the future). */
export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function leaseStatus(lease: Lease | null | undefined): LeaseStatus {
  if (!lease) return "vacant";
  const days = daysUntil(lease.end_date);
  if (days < 0) return "expired";
  if (days <= NOTICE_WINDOW_DAYS) return "expiring_soon";
  return "active";
}

export const STATUS_LABEL: Record<LeaseStatus, string> = {
  vacant: "Vacant",
  active: "Active",
  expiring_soon: "Expiring soon",
  expired: "Expired",
};

export const STATUS_BADGE_CLASS: Record<LeaseStatus, string> = {
  vacant: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-800",
  expiring_soon: "bg-amber-100 text-amber-800",
  expired: "bg-red-100 text-red-800",
};

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
