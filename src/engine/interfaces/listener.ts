// src/engine/interfaces/listener.ts

import { EventTrigger, ListenerSourceType } from '../types.ts';
import { Condition } from './condition.ts';
import { Operation } from './operation.ts';
import { CombatEntity } from './entity.ts';

export interface Listener {
	name:					string;
	sourceType:		ListenerSourceType;
	sourceIndex?: number;
	owner:				CombatEntity;
	isActive:			boolean;
	trigger:			EventTrigger;
	conditions:		Array<Condition>;
	operations:		Array<Operation>;
}

export interface Interruptor extends Listener {

}

export interface Responder extends Listener {

}
