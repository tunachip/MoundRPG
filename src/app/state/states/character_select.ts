// src/app/state/states/character_select.ts

import type { AppContext } from '../types.ts';
import type { Culture, AppEvent, AppState } from '../../../shared/index.ts';
import type { Entity } from '../../../actor/';

export function transition (
	state: AppState,
	ctx: AppContext,
	event: AppEvent,
) {
	switch (event) {
		case 'BUILD_CONFIRMED':
			return { state: 'pre_combat', ctx };
		default:
			return { state, ctx };
	}
}

export function selectBuild (
	state: AppState,
	choice: Culture,
) {

	const player: Entity = {
		name:				'default',  // get user input to set name
		level:			0,
		type:				'player',
		culture:		choice,
		hp:					20,
		maxHp:			20,
		energy:			0,
		maxEnergy:	6,
		moves :			[],
		blessings : [],
		inventory : { items: [], xp: 0 },
	};

	switch (choice) {
		case 'mason':
			player.moves.push({
				name: 'Roll Tide',
				definitionId: 1,
				fragments: [],
				maxFragments: 2,
			});
			player.moves.push({
				name: 'Stone Toss',
				definitionId: 2,
				fragments: [],
				maxFragments: 2,
			});
			break;
		case 'cultivist':
			player.moves.push({
				name: 'Fire Away',
				definitionId: 3,
				fragments: [],
				maxFragments: 2,
			});
			player.moves.push({
				name: 'Root Out',
				definitionId: 4,
				fragments: [],
				maxFragments: 2,
			});
			break;
		case 'nomad':
			player.moves.push({
				name: 'Blow Hard',
				definitionId: 6,
				fragments: [],
				maxFragments: 2,
			});
			player.moves.push({
				name: 'General Strike',
				definitionId: 7,
				fragments: [],
				maxFragments: 2,
			});
			break;
		case 'bastard':
			player.moves.push({
				name: 'Tear Into',
				definitionId: 5,
				fragments: [],
				maxFragments: 2,
			});
			player.moves.push({
				name: 'Blood Shot',
				definitionId: 15,
				fragments: [],
				maxFragments: 0,
			});
			break;
	}
	return transition(state, {player: player}, 'BUILD_CONFIRMED');
}
