"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/social/index.ts
var social_exports = {};
__export(social_exports, {
  FrequencySchema: () => FrequencySchema,
  FriendSchema: () => FriendSchema,
  InteractionSchema: () => InteractionSchema,
  RelationshipStatusSchema: () => RelationshipStatusSchema,
  getRelationshipStatus: () => getRelationshipStatus
});
module.exports = __toCommonJS(social_exports);

// src/social/logic.ts
var import_luxon = require("luxon");
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
  const lastContact = import_luxon.DateTime.fromISO(friend.lastContactedAt);
  const now = import_luxon.DateTime.now();
  const daysSince = Math.floor(now.diff(lastContact, "days").days);
  const target = FREQUENCY_DAYS[friend.targetFrequency];
  if (daysSince <= target) return "healthy";
  if (daysSince <= target * 1.5) return "decaying";
  return "critical";
};

// src/social/schemas.ts
var import_zod = require("zod");
var FrequencySchema = import_zod.z.enum([
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
var RelationshipStatusSchema = import_zod.z.enum(["healthy", "decaying", "critical", "unknown"]);
var InteractionSchema = import_zod.z.object({
  id: import_zod.z.uuid(),
  date: import_zod.z.iso.datetime(),
  // ISO 8601
  type: import_zod.z.enum(["call", "text", "meet", "social", "email"]),
  notes: import_zod.z.string().optional()
});
var FriendSchema = import_zod.z.object({
  id: import_zod.z.uuid().optional(),
  name: import_zod.z.string().min(1, "Name is required"),
  email: import_zod.z.email().optional(),
  avatarUrl: import_zod.z.url().optional(),
  tier: import_zod.z.enum(["inner", "outer", "network"]).default("network"),
  targetFrequency: FrequencySchema.default("monthly"),
  lastContactedAt: import_zod.z.iso.datetime().optional(),
  birthday: import_zod.z.string().regex(/^\d{2}-\d{2}$/, "Format MM-DD").optional(),
  tags: import_zod.z.array(import_zod.z.string()).default([]),
  interactions: import_zod.z.array(InteractionSchema).default([])
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FrequencySchema,
  FriendSchema,
  InteractionSchema,
  RelationshipStatusSchema,
  getRelationshipStatus
});
//# sourceMappingURL=index.cjs.map