// src/combat/listener/types.ts

import { ActorType, EventTrigger } from '../../shared';
import { OperationMatrix } from '../operation';
import { Condition } from '../condition';

export interface Listener {
	name: string;
	source: ListenerSource;
	owner: ListenerSource;
	isActive: boolean;
	triggers: Array<EventTrigger>;
	conditions: Array<Condition>;
	operations: OperationMatrix;
}

interface ListenerSource {
	type: ActorType;
	index: number;
}
