export * from "./database/repository.js"
export * from "./domains/friend/index.js"

export const greet = (name: string): string => {
	return `Skål, ${name}! The Core Runes are active.`
}
