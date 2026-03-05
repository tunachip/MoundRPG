// src/combat/ai/types.ts

import type { TemperamentTag } from '../../content/encounters/types.ts';

export interface CombatAiProfile {
	priorities: Array<TemperamentTag>;
	maxChainActions?: number;
}
