// src/content/encounters/registry.ts

import { ExampleEncounter } from './00_example.ts';
import type { EncounterDefinition } from './types.ts';

export const EncounterDefinitionsById: Record<number, EncounterDefinition> = {
	0: ExampleEncounter,
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
