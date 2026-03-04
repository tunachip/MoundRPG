// src/combat/listener/types.ts

import type { ActorType, EventTrigger } from '../../shared/types.ts';
import type { OperationMatrix } from '../operation/types.ts';
import type { Condition } from '../condition/types.ts';

export interface ListenerContext {
	name: string;
	source: ListenerSource;
	owner: ListenerSource;
	triggers: Array<EventTrigger>;
	conditions: Array<Condition>;
	operations: OperationMatrix;
	isActive?: boolean;
}

export interface Listener {
	name: string;
	source: ListenerSource;
	owner: ListenerSource;
	isActive: boolean;
	triggers: Array<EventTrigger>;
	conditions: Array<Condition>;
	operations: OperationMatrix;
}

export interface ListenerSource {
	type: ActorType;
	index: number;
}
