// src/social/logic.ts
import { DateTime } from "luxon";
var FREQUENCY_DAYS = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
  "ad-hoc": 9999
};
var getRelationshipStatus = (friend) => {
  if (!friend.lastContactedAt) return "unknown";
  if (friend.targetFrequency === "ad-hoc") return "healthy";
  const lastContact = DateTime.fromISO(friend.lastContactedAt);
  const now = DateTime.now();
  const daysSince = Math.floor(now.diff(lastContact, "days").days);
  const target = FREQUENCY_DAYS[friend.targetFrequency];
  if (daysSince <= target) return "healthy";
  if (daysSince <= target * 1.5) return "decaying";
  return "critical";
};

// src/social/schemas.ts
import { z } from "zod";
var FrequencySchema = z.enum([
  "weekly",
  // 7 days
  "monthly",
  // 30 days
  "quarterly",
  // 90 days
  "yearly",
  // 365 days
  "ad-hoc"
  // No pressure
]);
var RelationshipStatusSchema = z.enum(["healthy", "decaying", "critical", "unknown"]);
var InteractionSchema = z.object({
  id: z.uuid(),
  date: z.iso.datetime(),
  // ISO 8601
  type: z.enum(["call", "text", "meet", "social", "email"]),
  notes: z.string().optional()
});
var FriendSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.email().optional(),
  avatarUrl: z.url().optional(),
  tier: z.enum(["inner", "outer", "network"]).default("network"),
  targetFrequency: FrequencySchema.default("monthly"),
  lastContactedAt: z.iso.datetime().optional(),
  birthday: z.string().regex(/^\d{2}-\d{2}$/, "Format MM-DD").optional(),
  tags: z.array(z.string()).default([]),
  interactions: z.array(InteractionSchema).default([])
});
export {
  FrequencySchema,
  FriendSchema,
  InteractionSchema,
  RelationshipStatusSchema,
  getRelationshipStatus
};
//# sourceMappingURL=index.js.map