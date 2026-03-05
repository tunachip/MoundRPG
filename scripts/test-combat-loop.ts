import { createAiActions, createAiProfile, createCombatState, executeCombatTurn } from '../src/combat/index.ts';
import type { DeclaredAction } from '../src/combat/turn/index.ts';
import { getEncounterDefinition } from '../src/content/encounters/index.ts';
import { TestPlayerProfile } from '../src/content/profiles/index.ts';
import { createEncounterEntityFromDefinition } from '../src/world/index.ts';

function main (): void {
	const encounterDefinition = getEncounterDefinition(0);
	const encounterEntity = createEncounterEntityFromDefinition(encounterDefinition);
	const combat = createCombatState(TestPlayerProfile, [encounterEntity]);

	const playerIndex = 0;
	const encounterIndex = 1;
	const aiProfile = createAiProfile(encounterDefinition.temper);
	const aiActions = createAiActions(combat, encounterIndex, aiProfile);
	const playerActions: Array<DeclaredAction> = [
		{
			type: 'castMove',
			caster: { type: 'entity', index: playerIndex },
			move: { type: 'move', index: combat.entities[playerIndex].moves[0] },
			targets: [{ type: 'entity', index: encounterIndex }],
			chainIndex: 0,
		},
	];

	const turnResult = executeCombatTurn(combat, {
		[playerIndex]: playerActions,
		[encounterIndex]: aiActions,
	});

	process.stdout.write(JSON.stringify({
		turn: turnResult.turn,
		order: turnResult.order,
		player: {
			hp: combat.entities[playerIndex].hp,
			energy: combat.entities[playerIndex].energy,
			attunedTo: combat.entities[playerIndex].attunedTo,
		},
		encounter: {
			hp: combat.entities[encounterIndex].hp,
			energy: combat.entities[encounterIndex].energy,
		},
	}, null, 2));
	process.stdout.write('\n');
}

main();
