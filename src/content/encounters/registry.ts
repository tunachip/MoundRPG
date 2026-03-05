// src/content/encounters/registry.ts

import { ExampleEncounter } from './00_example.ts';
import { AggroRaiderEncounter } from './01_aggro_raider.ts';
import { TacticalGuardEncounter } from './02_tactical_guard.ts';
import { UtilityMysticEncounter } from './03_utility_mystic.ts';
import { ExplosiveDuelistEncounter } from './04_explosive_duelist.ts';
import { EarlySentinelEncounter } from './05_early_sentinel.ts';
import { MultiWeaverEncounter } from './06_multi_weaver.ts';
import { StatelyVicarEncounter } from './07_stately_vicar.ts';
import { OpportunistEncounter } from './08_opportunist.ts';
import { ChaosSavantEncounter } from './09_chaos_savant.ts';
import type { EncounterDefinition } from './types.ts';

export const EncounterDefinitionsById: Record<number, EncounterDefinition> = {
	0: ExampleEncounter,
	1: AggroRaiderEncounter,
	2: TacticalGuardEncounter,
	3: UtilityMysticEncounter,
	4: ExplosiveDuelistEncounter,
	5: EarlySentinelEncounter,
	6: MultiWeaverEncounter,
	7: StatelyVicarEncounter,
	8: OpportunistEncounter,
	9: ChaosSavantEncounter,
};

export function getEncounterDefinition (
	definitionId: number
): EncounterDefinition {
	const definition = EncounterDefinitionsById[definitionId];
	if (!definition) {
		throw new Error(`Unknown EncounterDefinition definitionId: ${definitionId}`);
	}
	return definition;
}
