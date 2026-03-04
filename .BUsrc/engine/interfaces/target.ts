// src/engine/interfaces/target.ts

import { TargetType } from '../types.ts';
import { CombatEntity } from './entity.ts';
import { CombatMove } from './move.ts';
import { CombatBlessing } from './blessing.ts';

export interface Target {
	type: TargetType;
	state: CombatEntity | CombatMove | CombatBlessing;
}
