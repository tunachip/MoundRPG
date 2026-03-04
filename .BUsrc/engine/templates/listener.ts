// src/engine/templates/listener.ts

import { Condition } from '../interfaces/condition.ts';
import { Operation } from '../interfaces/operation.ts';

export interface ListenerTemplate {
	trigger:		string;
	conditions: Array<Condition>,
	operations: Array<Operation>,
}
