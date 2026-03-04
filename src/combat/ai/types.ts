// src/combat/ai/types.ts

import type { Temperament } from '../../content/encounters/types.ts';

export interface CombatAiProfile {
	temperament: Temperament;
	maxChainActions?: number;
}
