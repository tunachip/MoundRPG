// src/actor/entity/types.ts

import type { Culture, EntityType } from '../../shared/types.ts';
import { Inventory } from '../item/index.ts';
import { Move } from '../move/index.ts';
import { Blessing } from '../blessing/index.ts';

export interface MoveMatrix {
	active: Array<Move>;
	banked: Array<Move>;
}

export interface Entity {
	name:			 string;
	level:		 number;
	type:			 EntityType;
	culture:	 Culture;
	hp:				 number;
	maxHp:		 number;
	energy:		 number;
	maxEnergy: number;
	moves:		 MoveMatrix;
	blessings: Array<Blessing>;
	inventory: Inventory;
	definitionId?: number;
	companions?: Array<Entity>;
}
