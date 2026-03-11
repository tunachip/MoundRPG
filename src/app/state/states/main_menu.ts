// src/app/state/states/main_menu.ts

import type { AppContext } from '../types.ts';
import type { AppEvent, AppState } from '../../../shared/index.ts';

export function transition (
	state: AppState,
	ctx: AppContext,
	event: AppEvent,
) {
	switch (event) {
		case 'NEW_GAME':
			return { state: 'character_select', ctx };
		default:
			return { state, ctx };
	}
}
