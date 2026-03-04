// src/engine/interfaces/entity.ts

import { EntityType, EntityCulture } from '../types.ts';
import { MoveData } from './move.ts';
import { BlessingData } from './blessing.ts';
import { Inventory } from './item.ts';
import { StatusState, StatusTurns } from './status.ts';
import { AttunementState, AttunementTurns } from './attunement.ts';
import { OperationContext } from './operation.ts';

export interface EntityData {
	name:				string;
	level:			number;
	culture:		EntityCulture;
	entityType:	EntityType;
	hp:					number;
	maxHp:			number;
	energy:			number;
	maxEnergy:	number;
	moves:			Array<MoveData>;
	blessings:	Array<BlessingData>;
	currency:		number;
	inventory:  Inventory;
}

export interface CombatEntity {
	name:							string;
	level:						number;
	culture:					EntityCulture;
	entityType:				EntityType;
	hp:								number;
	maxHp:						number;
	energy:						number;
	maxEnergy:				number;
	curseRisk:				number;
	attunedTo:				AttunementState;
	turnsAttuned:			AttunementTurns;
	hasStatus:				StatusState;
	statusTurns:			StatusTurns;
	maxStatusTurns:		StatusTurns;
	immuneToStatus:		StatusState;
	maxDamageTaken:		number;
	lastDamageTaken:	number;
	totalDamageTaken: number;
	ownedMoves:				Array<number>;
	ownedBlessings:		Array<number>;
}


