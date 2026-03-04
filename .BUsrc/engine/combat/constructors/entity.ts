// src/engine/combat/entity.ts

import { EntityData, CombatEntity } from '../../interfaces/entity.ts';
import { GameElements, Statuses } from '../../constants.ts';
import { keyMap } from '../../helpers.ts';


export function initializeCombatEntity (
	data: EntityData
): CombatEntity {
	const entity: CombatEntity = {
		...data,
		curseRisk: 0,
		attunedTo: keyMap(GameElements, false),
		turnsAttuned:	keyMap(GameElements, 0),
		hasStatus: keyMap(Statuses, false),
		statusTurns: keyMap(Statuses, 0),
		maxStatusTurns:	keyMap(Statuses, 0),
		immuneToStatus:	keyMap(Statuses, false),
		maxDamageTaken:	0,
		lastDamageTaken: 0,
		totalDamageTaken: 0,
		ownedMoves:	[],
		ownedBlessings:	[],
	};
	return entity;
}
