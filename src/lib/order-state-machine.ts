import { OrderStatus } from "@prisma/client";

/**
 * Order state machine transitions
 * Defines valid state changes for order lifecycle
 */
export const ORDER_STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
  ACCEPTED: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  IN_PROGRESS: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Check if a status transition is valid
 */
export function canTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const allowedTransitions = ORDER_STATE_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

/**
 * Validate a status transition and return error message if invalid
 */
export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { valid: boolean; error?: string } {
  if (currentStatus === newStatus) {
    return {
      valid: false,
      error: `Order is already ${currentStatus.toLowerCase()}`,
    };
  }

  if (canTransition(currentStatus, newStatus)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `Cannot transition from ${currentStatus.toLowerCase()} to ${newStatus.toLowerCase()}`,
  };
}

/**
 * Get allowed next states for current status (useful for UI rendering)
 */
export function getNextStates(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATE_TRANSITIONS[currentStatus];
}
