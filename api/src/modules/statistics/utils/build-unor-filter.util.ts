/**
 * Utility untuk membangun filter WHERE
 * berdasarkan subtree UNOR.
 */

export function buildUnorWhere(unorIds?: bigint[]) {
  if (!unorIds || unorIds.length === 0) {
    return {}
  }

  return {
    unorId: {
      in: unorIds,
    },
  }
}