// src/combat/ai/types.ts

import { Temperament } from '../../content/encounters/index.ts';

export interface CombatAiProfile {
	temperament: Temperament;
	maxChainActions?: number;
}
