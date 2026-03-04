// src/actor/item/types.ts

export interface Item {
	name: string;
	definitionId: number;
	isExhausted: boolean;
}

export interface Inventory {
	items: Array<Item>;
	xp: number;
}

