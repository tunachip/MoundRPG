import { createAiActions, createAiProfile, createCombatState } from '../src/combat/index.ts';
import { getEncounterDefinition } from '../src/content/encounters/index.ts';
import { TestPlayerProfile } from '../src/content/profiles/index.ts';
import { createEncounterEntityFromDefinition } from '../src/world/index.ts';

function main (): void {
	const encounterDefinition = getEncounterDefinition(0);
	const encounterEntity = createEncounterEntityFromDefinition(encounterDefinition);
	const combat = createCombatState(TestPlayerProfile, [encounterEntity]);
	const encounterIndex = 1;
	const profile = createAiProfile(encounterDefinition.tempers);
	const actions = createAiActions(combat, encounterIndex, profile);

	process.stdout.write(JSON.stringify({
		encounter: encounterDefinition.name,
		tempers: encounterDefinition.tempers,
		entityCount: combat.entities.length,
		moveCount: combat.moves.length,
		listenerCount: combat.listeners.length,
		actions,
	}, null, 2));
	process.stdout.write('\n');
}

main();
