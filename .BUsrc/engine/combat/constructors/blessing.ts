// src/engine/combat/blessing.ts

import { BlessingData, CombatBlessing } from '../../interfaces/blessing.ts';
import { getBlessingTemplate } from '../../../data/blessings/index.ts';

export async function initializeCombatBlessings (
	ownerIndex: number,
	blessingTemplates: Array<BlessingData>
): Promise<Array<CombatBlessing>> {
	const blessings: Array<CombatBlessing> = [];
	for (const template of blessingTemplates) {
		blessings.push(await initializeCombatBlessing(ownerIndex, template));
	}
	return blessings;
}

async function initializeCombatBlessing (
	ownerIndex: number,
	blessingTemplate: BlessingData
): Promise<CombatBlessing> {
	const data = await getBlessingTemplate(blessingTemplate.templateId);
	return {
		name: data.name,
		ownerIndex: ownerIndex,
		isActive: !blessingTemplate.isExhausted,
		cooldownTurns: 0,
		ownedListenerIndexes: [],
	};
}
