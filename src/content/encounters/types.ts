// src/content/encounters/types.ts

import type { Culture } from '../../shared/types.ts';
import type { Move } from '../../actor/move/types.ts';
import type { Blessing } from '../../actor/blessing/types.ts';

export const TemperamentTags = [
	'utilitarian',
	'aggressive',
	'health-conscious',
	'multi-tasker',
	'tactical',
	'stately',
	'defensive',
	'offensive',
	'explosive',
	'earlybird',
	'frugal',
	'spendthrift',
] as const;

export type TemperamentTag = typeof TemperamentTags[number];

export interface EncounterDefinition {
	definitionId: number;
	name: string;
	level: number;
	culture: Culture;
	tempers: Array<TemperamentTag>;
	hp: number;
	maxHp: number;
	energy: number;
	maxEnergy: number;
	moves: Array<Move>;
	blessings: Array<Blessing>;
}
