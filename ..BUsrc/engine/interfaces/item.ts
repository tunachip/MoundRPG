// src/engine/interfaces/item.ts

export interface ItemData {
	templateId:  number;
	isExhausted: boolean;
}

export interface DropData extends ItemData {
	weight: number;
}

export interface Inventory {
	items: Array<ItemData>;
}
