export * from "./database/repository"
export * from "./domains/friend"

export const greet = (name: string): string => {
	return `Skål, ${name}! The Core Runes are active.`
}
