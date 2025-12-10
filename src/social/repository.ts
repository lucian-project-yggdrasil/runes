import { CosmosRepository } from "../core"
import { CONTAINERS } from "../core/constants"
import type { Friend } from "./schemas"

export class FriendRepository extends CosmosRepository<Friend> {
	constructor() {
		super(CONTAINERS.FRIENDS)
	}

	async findByEmail(tenantId: string, email: string): Promise<Friend | null> {
		const results = await this.query(tenantId, "SELECT * FROM c WHERE c.email = @email", [
			{ name: "@email", value: email },
		])
		return results[0] || null
	}
}
