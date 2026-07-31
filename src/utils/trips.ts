import type { CollectionEntry } from 'astro:content';

export function isPublishedTrip(trip: CollectionEntry<'trips'>) {
	return trip.data.status === 'published';
}

export function sortTripsByStartDate(a: CollectionEntry<'trips'>, b: CollectionEntry<'trips'>) {
	return b.data.startDate.valueOf() - a.data.startDate.valueOf();
}
