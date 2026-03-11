// src/content/moves/registry.ts

import { RollTide } from './01_roll_tide.ts';
import { StoneToss } from './02_stone_toss.ts';
import { FireAway } from './03_fire_away.ts';
import { RootOut } from './04_root_out.ts';
import { TearInto } from './05_tear_into.ts';
import { BlowHard } from './06_blow_hard.ts';
import { GeneralStrike } from './07_general_strike.ts';
import { Mistify } from './11_mistify.ts';
import { BloodShot } from './15_blood_shot.ts';
import type { MoveDefinition } from './types.ts';

export const MoveDefinitionsById: Record<number, MoveDefinition> = {
	1: RollTide,
	2: StoneToss,
	3: FireAway,
	4: RootOut,
	5: TearInto,
	6: BlowHard,
	7: GeneralStrike,
	11: Mistify,
	15: BloodShot,
};

export function getMoveDefinition (definitionId: number): MoveDefinition {
	const definition = MoveDefinitionsById[definitionId];
	if (!definition) {
		throw new Error(`Unknown MoveDefinition definitionId: ${definitionId}`);
	}
	return definition;
}
