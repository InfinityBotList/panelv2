import { writable, type Writable } from 'svelte/store';
import type { PartialUser } from './generated/arcadia/PartialUser';

export const globalUserCache: Writable<Map<string, PartialUser> | null> = writable(new Map());