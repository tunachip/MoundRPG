// src/combat/listener/constructor.ts

import { Actor } from '../../actor';
import { CombatState } from '../state';
import { Listener, ListenerContext } from './types.ts';

export function createListener (
	ctx: ListenerContext
): Listener {
	return {
		name:					ctx.name,
		source:				ctx.source,
		owner:				ctx.owner,
		isActive:			ctx.isActive ?? false,
		triggers:			ctx.triggers,
		conditions:		ctx.conditions,
		operations:		ctx.operations,
	};
}

export function registerListeners (
	combat: CombatState,
	listeners: Array<Listener>
): Array<Actor> {
	const listenerActors: Array<Actor> = [];

	for (const listener of listeners) {
		const index = combat.listeners.length;
		combat.listeners.push(listener);
		listenerActors.push({
			type: 'listener',
			index,
		});
	}

	return listenerActors;
}
