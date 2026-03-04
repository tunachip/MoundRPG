// src/engine/interfaces/blessing.ts

import { ItemData } from './item.ts';

export interface BlessingData extends ItemData {
}

export interface CombatBlessing {
	name:						 string;
	ownerIndex:			 number;
	isActive:				 boolean;
	cooldownTurns:	 number;
	listenerIndexes: Array<number>;
}

