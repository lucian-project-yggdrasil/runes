// src/core/database/repository.ts
import { CosmosClient } from "@azure/cosmos";
var BaseRepository = class {
  constructor(connectionString, databaseName, containerName) {
    this.connectionString = connectionString;
    this.databaseName = databaseName;
    this.containerName = containerName;
  }
  container = null;
  async getContainer() {
    if (!this.container) {
      const client = new CosmosClient(this.connectionString);
      const db = client.database(this.databaseName);
      this.container = db.container(this.containerName);
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
import { z } from "zod";
var FriendSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string().min(1, "Name is required"),
  status: z.enum(["Cold", "Warm", "Hot"]),
  createdAt: z.iso.datetime(),
  email: z.email().optional(),
  location: z.string().optional()
});
var CreateFriendSchema = FriendSchema.pick({
  name: true,
  email: true,
  location: true
}).extend({
  status: z.enum(["Cold", "Warm", "Hot"]).default("Warm")
});

// src/core/index.ts
var greet = (name) => {
  return `Sk\xE5l, ${name}! The Core Runes are active.`;
};
export {
  BaseRepository,
  CreateFriendSchema,
  FriendSchema,
  greet
};
//# sourceMappingURL=index.js.map