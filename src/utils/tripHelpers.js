/**
 * Utility functions for multi-city trip leg chain routing.
 */

export function getSortedLegs(legs) {
  if (!legs) return [];
  return Object.entries(legs)
    .map(([id, leg]) => ({ id, ...leg }))
    .sort((a, b) => a.order - b.order);
}

export function getOriginForLeg(sortedLegs, legIndex, homeAirport) {
  if (legIndex === 0) return homeAirport;
  return sortedLegs[legIndex - 1]?.destination?.code || homeAirport;
}

export function getInboundDestination(sortedLegs, legIndex, homeAirport) {
  if (legIndex >= sortedLegs.length - 1) return homeAirport;
  return sortedLegs[legIndex + 1]?.destination?.code || homeAirport;
}

export function getOriginName(sortedLegs, legIndex, homeAirportName) {
  if (legIndex === 0) return homeAirportName;
  return sortedLegs[legIndex - 1]?.destination?.city || homeAirportName;
}

export function getInboundDestName(sortedLegs, legIndex, homeAirportName) {
  if (legIndex >= sortedLegs.length - 1) return homeAirportName;
  return sortedLegs[legIndex + 1]?.destination?.city || homeAirportName;
}

export function calculateTripTotal(sortedLegs) {
  return sortedLegs.reduce((total, leg) => {
    const outPrice = leg.outbound?.summary?.price || 0;
    const inPrice = leg.inbound?.summary?.price || 0;
    return total + outPrice + inPrice;
  }, 0);
}
