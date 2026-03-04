// src/content/encounters/types.ts

import { Culture } from '../../shared/index.ts';
import { Move, Blessing } from '../../actor/index.ts';

export const Temperaments = [
	'normal',
	'timid',
	'aggressive',
	'tactical',
] as const;

export type Temperament = typeof Temperaments[number];

export interface EncounterDefinition {
	definitionId: number;
	name: string;
	level: number;
	culture: Culture;
	temper: Temperament;
	hp: number;
	maxHp: number;
	energy: number;
	maxEnergy: number;
	moves: Array<Move>;
	blessings: Array<Blessing>;
}
