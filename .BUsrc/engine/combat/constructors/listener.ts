// src/engine/combat/listener.ts

import { EventTrigger, ListenerSourceType } from '../../types.ts';
import { Listener } from '../../interfaces/listener.ts';
import { ListenerTemplate } from '../../templates/listener.ts';

export function initializeListeners (
	sourceIndex: number,
	sourceType: ListenerSourceType,
	ownerIndex: number,
	listenerTemplates: Array <ListenerTemplate>
): Array<Listener> {
	const listeners: Array<Listener> = [];
	for (const [index, template] of listenerTemplates.entries()) {
		listeners.push({
			name: `${sourceType}-${sourceIndex}-listener-${index}`,
			sourceType: sourceType,
			sourceIndex: sourceIndex,
			ownerIndex: ownerIndex,
			isActive: false,
			trigger: template.trigger as EventTrigger,
			conditions: template.conditions,
			operations: template.operations,
		});
	}
	return listeners;
}
