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

// src/core/index.ts
var core_exports = {};
__export(core_exports, {
  BaseRepository: () => BaseRepository,
  CreateFriendSchema: () => CreateFriendSchema,
  FriendSchema: () => FriendSchema,
  greet: () => greet
});
module.exports = __toCommonJS(core_exports);

// src/core/database/repository.ts
var import_cosmos = require("@azure/cosmos");
var BaseRepository = class {
  constructor(connectionString, databaseName, containerName) {
    this.connectionString = connectionString;
    this.databaseName = databaseName;
    this.containerName = containerName;
  }
  container = null;
  async getContainer() {
    if (!this.container) {
      const client = new import_cosmos.CosmosClient(this.connectionString);
      const db = client.database(this.databaseName);
      const { container } = await db.containers.createIfNotExists({
        id: this.containerName,
        partitionKey: "/tenantId"
      });
      this.container = container;
    }
    return this.container;
  }
  // Generic Query: Automatically enforces Tenant Isolation
  async findByTenant(tenantId, querySpec) {
    const container = await this.getContainer();
    const query = querySpec ? `${querySpec} AND c.tenantId = @tenantId` : `SELECT * FROM c WHERE c.tenantId = @tenantId`;
    const { resources } = await container.items.query({
      query,
      parameters: [{ name: "@tenantId", value: tenantId }]
    }).fetchAll();
    return resources;
  }
  async create(item) {
    const container = await this.getContainer();
    const { resource } = await container.items.create(item);
    return resource;
  }
};

// src/core/domains/friend/index.ts
var import_zod = require("zod");
var FriendSchema = import_zod.z.object({
  id: import_zod.z.uuid(),
  tenantId: import_zod.z.string(),
  name: import_zod.z.string().min(1, "Name is required"),
  status: import_zod.z.enum(["Cold", "Warm", "Hot"]),
  createdAt: import_zod.z.iso.datetime(),
  email: import_zod.z.email().optional(),
  location: import_zod.z.string().optional()
});
var CreateFriendSchema = FriendSchema.pick({
  name: true,
  email: true,
  location: true
}).extend({
  status: import_zod.z.enum(["Cold", "Warm", "Hot"]).default("Warm")
});

// src/core/index.ts
var greet = (name) => {
  return `Sk\xE5l, ${name}! The Core Runes are active.`;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseRepository,
  CreateFriendSchema,
  FriendSchema,
  greet
});
//# sourceMappingURL=index.cjs.map