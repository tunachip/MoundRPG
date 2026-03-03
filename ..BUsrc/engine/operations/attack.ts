// src/engine/operations/attack.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { calculateDamage, resolveDamage } from './damage.ts';
import { heal } from './special.ts';

export function attack (
	args: OperationContext
): OperationResult {
	const attackResult = calculateDamage(args, true);
	const damage	 = attackResult[0];
	const absorbed = attackResult[1];
	const blocked  = attackResult[2];
	switch (true) {
		case absorbed > 0:
			return heal(args);
		case blocked:
			return { breaks: false };
		default:
			args.calculatedDamage = damage;
			return resolveDamage(args);
	}
}
	
