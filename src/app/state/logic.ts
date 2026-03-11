// app/state/logic.ts

import type { AppStateManager, AppContext } from './types.ts';
import type { AppEvent, AppState } from '../../shared/index.ts';

export function createAppState (
): AppStateManager {
	return {
		state: 'main_menu',
		ctx: {},
	}
};


export function transition (
	state: AppState,
	ctx: AppContext,
	event: AppEvent,
) {
	switch(state) {
		case 'main_menu':
			if (event === 'NEW_GAME') {
				return { state: 'character_select', ctx };
			}
			return { state, ctx };

		case 'character_select':
			if (event === 'BUILD_CONFIRMED') {
				return { state: 'pre_combat', ctx };
			}
			return { state, ctx };
		
		case 'pre_combat':
			if (event === 'START_COMBAT') {
				return { state: 'combat', ctx };
			}
			return { state, ctx };
		
		case 'combat':
			if (event === 'COMBAT_WON') {
				return { state: 'upgrade', ctx };
			}
			if (event === 'COMBAT_LOST') {
				return { state: 'game_over_memento', ctx };
			}
			return { state, ctx };

		case 'upgrade':
			if (event === 'UPGRADE_DONE') {
				return { state: 'pre_combat', ctx };
			}
			return { state, ctx };

		case 'game_over_memento':
			if (event === 'MEMENTO_CHOSEN') {
				return { state: 'game_over_stats', ctx };
			}

		case 'game_over_stats':
			if (event === 'RETURN_TO_MENU') {
				return { state: 'main_menu', ctx };
			}
	}
}
