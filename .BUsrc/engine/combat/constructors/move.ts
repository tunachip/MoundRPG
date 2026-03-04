// src/engine/combat/move.ts

import { MoveData, CombatMove } from '../../interfaces/move.ts';
import { getMoveTemplate } from '../getters/move.ts';

export async function initializeCombatMoves (
	ownerIndex: number,
	moveTemplates: Array<MoveData>
): Promise<Array<CombatMove>> {
	const moves: Array<CombatMove> = [];
	for (const template of moveTemplates) {
		moves.push(await initializeCombatMove(ownerIndex, template));
	}
	return moves;
}

async function initializeCombatMove (
	ownerIndex: number,
	moveTemplate: MoveData
): Promise<CombatMove> {
	const data = await getMoveTemplate(moveTemplate.templateId);
	const move: CombatMove = {
		name: data.name,
		ownerIndex: ownerIndex,
		isActive: false,
		moveType: data.moveType,
		moveSpeed: data.moveSpeed,
		element: data.element,
		isBound: false,
		isHidden: false,
		canChain: data.canChain,
		canBeChainedInto: data.canBeChainedInto,
		operations: data.operations,
		cooldownTurns: 0,
		whileActiveListenerIndexes: [],
		whileBankedListenerIndexes: [],
		whileOnCooldownListenerIndexes: [],
	};
	return move;
}

