import { type Container, CosmosClient } from "@azure/cosmos"

export class BaseRepository<T extends { id: string; tenantId: string }> {
	private container: Container | null = null

	constructor(
		private connectionString: string,
		private databaseName: string,
		private containerName: string,
	) {}

	private async getContainer(): Promise<Container> {
		if (!this.container) {
			const client = new CosmosClient(this.connectionString)
			const db = client.database(this.databaseName)
			this.container = db.container(this.containerName)
		}
		return this.container
	}

	// Generic Query: Automatically enforces Tenant Isolation
	async findByTenant(tenantId: string, querySpec?: string): Promise<T[]> {
		const container = await this.getContainer()

		// Default to "Select All" if no custom query provided
		const query = querySpec
			? `${querySpec} AND c.tenantId = @tenantId`
			: `SELECT * FROM c WHERE c.tenantId = @tenantId`

		const { resources } = await container.items
			.query({
				query,
				parameters: [{ name: "@tenantId", value: tenantId }],
			})
			.fetchAll()

		return resources as T[]
	}

	async create(item: T): Promise<T> {
		const container = await this.getContainer()
		const { resource } = await container.items.create(item)
		return resource as T
	}
}
