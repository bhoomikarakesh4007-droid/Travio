import destinationData, { getDestinationsById, resolveDestination } from "../data/destinationData";

// Service boundary for destination consumers. It deliberately delegates to the
// catalogue so no page can receive a partial or alternate destination record.
export async function getDestination(reference) {
  return resolveDestination(reference);
}

export async function getDestinations(destinationIds) {
  return destinationIds ? getDestinationsById(destinationIds) : Object.values(destinationData);
}

export { destinationData, getDestinationsById, resolveDestination };
