import { DateTime } from "luxon"
import type { Frequency, Friend, RelationshipStatus } from "./schemas"

const FREQUENCY_DAYS: Record<Frequency, number> = {
	weekly: 7,
	monthly: 30,
	quarterly: 90,
	yearly: 365,
	"ad-hoc": 9999,
}

/**
 * Calculates the health of a relationship based on frequency targets.
 */
export const getRelationshipStatus = (friend: Friend): RelationshipStatus => {
	// Unknown / New
	if (!friend.lastContactedAt) return "unknown"

	// Ad-hoc (Never decays)
	if (friend.targetFrequency === "ad-hoc") return "healthy"

	const lastContact = DateTime.fromISO(friend.lastContactedAt)
	const now = DateTime.now()
	const daysSince = Math.floor(now.diff(lastContact, "days").days)
	const target = FREQUENCY_DAYS[friend.targetFrequency]

	if (daysSince <= target) return "healthy"
	if (daysSince <= target * 1.5) return "decaying" // Grace Period
	return "critical"
}
