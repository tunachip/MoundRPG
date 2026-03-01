// src/engine/operations/special.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { maxClamped } from '../helpers.ts';
import { calculateDamage, resolveDamage } from './damage.ts';

export function heal (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	const amount = args.absorbs ?? args.heals ?? 0;
	if (target && amount) {
		const now = target.hp;
		const max = target.maxHp;
		const after = maxClamped(now, amount, max);
		if (after[0] > 0) {
			const extra = after[1];
			if (extra > 0) {
				// TODO: EmitSignal Overheal
			}
			target.hp = after[0];
		}
	}
	return { breaks: false };
}

export function openWounds (
	args: OperationContext,
	all: boolean = true
): OperationResult {
	const target = args.targetEntity;
	const amount = args.amount ?? 'all';
	if (target) {
		if (all || amount === 'all') {
			const now = target.statusTurns.wound;
			for (let i = 0; i < now; i++) {
				const damageResult = calculateDamage({
					caster: args.caster,
					element: 'vital',
					targetEntity: args.targetEntity,
					baseDamage: 1,
				});
				const calculatedDamage = damageResult[0];
				if (calculatedDamage > 0) {
					const damageOutcome = resolveDamage({
						caster: args.caster,
						element: 'vital',
						targetEntity: args.targetEntity,
						calculatedDamage: calculatedDamage,
					});
					if (damageOutcome.breaks) {
						return { breaks: true };
					}
				}
			}
		}
	}
	return { breaks: false };
}
