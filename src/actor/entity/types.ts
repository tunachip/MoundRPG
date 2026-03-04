// src/actor/entity/types.ts

import { Culture, EntityType } from '../../shared';
import { Inventory } from '../item';
import { Move } from '../move';
import { Blessing } from '../blessing';

export interface Entity {
	name:			 string;
	level:		 number;
	type:			 EntityType;
	culture:	 Culture;
	hp:				 number;
	maxHp:		 number;
	energy:		 number;
	maxEnergy: number;
	moves:		 Array<Move>;
	blessings: Array<Blessing>;
	inventory: Inventory;
	definitionId?: number;
}

