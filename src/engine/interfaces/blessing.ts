// src/engine/interfaces/blessing.ts

import { ItemData } from './item.ts';
import { Condition } from './event.ts';
import { EventTrigger } from '../types.ts';

export interface BlessingData extends ItemData {
}

export interface CombatBlessing {
	name: string;
	ownerIndex: number;
	eventTrigger: EventTrigger;
	conditions: Array<Condition>;
	isActive: boolean;
	cooldownTurns: number;
}

