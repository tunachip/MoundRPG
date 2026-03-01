// src/engine/combat/blessing.ts

import { BlessingData, CombatBlessing } from '../interfaces/blessing.ts';
import { BlessingIndex } from '../../data/blessings/index.ts';

export function initializeCombatBlessings (
	ownerIndex: number,
	blessingTemplates: Array<BlessingData>
): Array<CombatBlessing> {
	const blessings = [];
	for (const template of blessingTemplates) {
		// TODO: Create Blessing Initializer Logic
	}
	return blessings;
}

