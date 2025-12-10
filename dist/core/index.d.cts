import { CosmosClient } from '@azure/cosmos';
export { B as BaseEntity, C as CosmosRepository } from '../repository-D9FUt04Y.cjs';

declare const YGGDRASIL_DB = "yggdrasil-data";
declare const CONTAINERS: {
    readonly USERS: "users";
    readonly FRIENDS: "friends";
};

declare const getCosmosClient: () => CosmosClient;

type LogLevel = "info" | "warn" | "error" | "debug";
declare class RunesLogger {
    private isDev;
    private format;
    info(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    debug(message: string, data?: unknown): void;
}
declare const Logger: RunesLogger;

declare const greet: (name: string) => string;

export { CONTAINERS, type LogLevel, Logger, YGGDRASIL_DB, getCosmosClient, greet };
