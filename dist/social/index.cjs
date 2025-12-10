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
  CreateFriendSchema: () => CreateFriendSchema,
  FrequencySchema: () => FrequencySchema,
  FriendRepository: () => FriendRepository,
  FriendSchema: () => FriendSchema,
  InteractionSchema: () => InteractionSchema,
  RelationshipStatusSchema: () => RelationshipStatusSchema,
  TierSchema: () => TierSchema,
  UpdateFriendSchema: () => UpdateFriendSchema,
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

// src/core/constants.ts
var YGGDRASIL_DB = "yggdrasil-data";
var CONTAINERS = {
  USERS: "users",
  FRIENDS: "friends"
};

// src/core/cosmos/client.ts
var import_cosmos = require("@azure/cosmos");

// src/core/logger/index.ts
var RunesLogger = class {
  isDev = process.env.NODE_ENV !== "production";
  format(level, message, data) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    if (this.isDev) {
      const color = level === "error" ? "\x1B[31m" : level === "warn" ? "\x1B[33m" : "\x1B[36m";
      const reset = "\x1B[0m";
      console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`);
      if (data) console.dir(data, { depth: null, colors: true });
    } else {
      console.log(
        JSON.stringify({
          timestamp,
          level,
          message,
          data,
          app: process.env.WEBSITE_SITE_NAME || "Local"
        })
      );
    }
  }
  info(message, data) {
    this.format("info", message, data);
  }
  error(message, data) {
    this.format("error", message, data);
  }
  warn(message, data) {
    this.format("warn", message, data);
  }
  debug(message, data) {
    this.format("debug", message, data);
  }
};
var Logger = new RunesLogger();

// src/core/cosmos/client.ts
var clientInstance = null;
var getCosmosClient = () => {
  if (clientInstance) {
    return clientInstance;
  }
  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  if (!connectionString) {
    Logger.error("CRITICAL: COSMOS_CONNECTION_STRING is missing from environment variables.");
    throw new Error("COSMOS_CONNECTION_STRING is missing.");
  }
  Logger.info("\u26A1 Initializing new Cosmos Client Connection...");
  clientInstance = new import_cosmos.CosmosClient(connectionString);
  return clientInstance;
};

// src/core/cosmos/repository.ts
var CosmosRepository = class {
  constructor(containerName) {
    this.containerName = containerName;
  }
  container = null;
  /**
   * Lazy-loads the container.
   * Ensures we reuse the Single Connection from 'client.ts'.
   */
  async getContainer() {
    if (!this.container) {
      const client = getCosmosClient();
      const database = client.database(YGGDRASIL_DB);
      const { container } = await database.containers.createIfNotExists({
        id: this.containerName,
        partitionKey: "/tenantId"
      });
      this.container = container;
    }
    return this.container;
  }
  async create(item) {
    const container = await this.getContainer();
    Logger.info(`[Cosmos] Creating item in ${this.containerName}`, { id: item.id });
    const { resource } = await container.items.create(item);
    return resource;
  }
  async get(id, tenantId) {
    const container = await this.getContainer();
    try {
      const { resource } = await container.item(id, tenantId).read();
      return resource || null;
    } catch (error) {
      const cosmosError = error;
      if (cosmosError.code === 404) return null;
      throw error;
    }
  }
  async fetchAll(tenantId) {
    const container = await this.getContainer();
    const querySpec = {
      query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
      parameters: [{ name: "@tenantId", value: tenantId }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  }
  async update(item) {
    const container = await this.getContainer();
    const { resource } = await container.items.upsert(item);
    return resource;
  }
  async delete(id, tenantId) {
    const container = await this.getContainer();
    await container.item(id, tenantId).delete();
  }
  /**
   * Custom Query
   * Allows specific WHERE clauses, but forces Tenant ID injection.
   */
  async query(tenantId, query, parameters = []) {
    const container = await this.getContainer();
    const safeQuery = `${query} AND c.tenantId = @tenantId`;
    const querySpec = {
      query: safeQuery,
      parameters: [...parameters, { name: "@tenantId", value: tenantId }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  }
};

// src/social/repository.ts
var FriendRepository = class extends CosmosRepository {
  constructor() {
    super(CONTAINERS.FRIENDS);
  }
  async findByEmail(tenantId, email) {
    const results = await this.query(tenantId, "SELECT * FROM c WHERE c.email = @email", [
      { name: "@email", value: email }
    ]);
    return results[0] || null;
  }
};

// src/social/schemas.ts
var import_zod = require("zod");
var TierSchema = import_zod.z.enum(["inner", "outer", "network"]);
var FrequencySchema = import_zod.z.enum([
  "weekly",
  // 7 days (Inner Circle)
  "monthly",
  // 30 days (Close Friends)
  "quarterly",
  // 90 days (Network)
  "yearly",
  // 365 days (Distant)
  "ad-hoc"
  // No pressure (Coworkers)
]);
var InteractionSchema = import_zod.z.strictObject({
  id: import_zod.z.uuid(),
  date: import_zod.z.iso.datetime(),
  // ISO 8601
  type: import_zod.z.enum(["call", "text", "meet", "social", "email"]),
  notes: import_zod.z.string().optional()
});
var RelationshipStatusSchema = import_zod.z.enum(["healthy", "decaying", "critical", "unknown"]);
var FriendSchema = import_zod.z.strictObject({
  // Infrastructure
  id: import_zod.z.uuid(),
  // UUID
  tenantId: import_zod.z.string().min(1, "Tenant ID is required"),
  // Partition Key
  createdAt: import_zod.z.iso.datetime(),
  updatedAt: import_zod.z.iso.datetime().optional(),
  // Identity
  name: import_zod.z.string().min(1, "Name is required"),
  email: import_zod.z.email().optional(),
  avatarUrl: import_zod.z.url().optional(),
  // The Engine (Decay Algorithm)
  tier: TierSchema.default("network"),
  targetFrequency: FrequencySchema.default("monthly"),
  lastContactedAt: import_zod.z.iso.datetime().optional(),
  // Context
  birthday: import_zod.z.string().regex(/^\d{2}-\d{2}$/, "Format MM-DD").optional(),
  tags: import_zod.z.array(import_zod.z.string()).default([]),
  facts: import_zod.z.array(import_zod.z.string()).default([]),
  interactions: import_zod.z.array(InteractionSchema).default([])
});
var CreateFriendSchema = FriendSchema.omit({
  // Blacklisted props
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  interactions: true
});
var UpdateFriendSchema = CreateFriendSchema.partial();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateFriendSchema,
  FrequencySchema,
  FriendRepository,
  FriendSchema,
  InteractionSchema,
  RelationshipStatusSchema,
  TierSchema,
  UpdateFriendSchema,
  getRelationshipStatus
});
//# sourceMappingURL=index.cjs.map