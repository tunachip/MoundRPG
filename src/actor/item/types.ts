// src/actor/item/types.ts

export interface Item {
	name: string;
	isExhausted: boolean;
}

export interface Inventory {
	items: Array<Item>;
	xp: number;
}

export interface ItemDefinition {

}
