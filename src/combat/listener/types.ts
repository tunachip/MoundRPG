// src/combat/listener/types.ts

import { ActorType, EventTrigger } from '../../shared';
import { OperationMatrix } from '../operation';
import { Condition } from '../condition';

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
