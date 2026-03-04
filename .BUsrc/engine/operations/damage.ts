// src/engine/operations/damage.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { currentAttunements } from '../combat/entity.ts';
import { ElementRules } from '../rules.ts';
import { openWounds } from './special.ts';
import { minClamped } from '../helpers.ts';

export function calculateDamage (
	args: OperationContext,
	fromAttack: boolean = false
): [number, number, boolean] {
	if (fromAttack) {
		args = applyEntityStatusModifiers(args);
	}
	args = applyElementRulesModifiers(args);
	const damage = args.calculatedDamage ?? 0;
	const absorbs = args.absorbs ?? 0;
	const blocked = args.blocked ?? false;
	return [damage, absorbs, blocked];
}

export function applyEntityStatusModifiers (
	args: OperationContext
): OperationContext {
	const caster = args.caster;
	const target = args.targetEntity;
	const baseDamage = args.baseDamage;
	if (caster && target && baseDamage && baseDamage > 0) {
		let damage = baseDamage;
		if (caster.hasStatus['strong']) damage += 1
		if (target.hasStatus['tough']) damage -= 1
		args.calculatedDamage = damage;
	}
	return args;
}

export function applyElementRulesModifiers (
	args: OperationContext
): OperationContext {
	const element = args.element;
	const target = args.targetEntity;
	const baseDamage = args.calculatedDamage ?? args.baseDamage;
	if (element && target && baseDamage) {
		let damage = baseDamage;
		let absorbed = 0;
		let blocked = false;
		const attunements = currentAttunements(target);
		const relationships = ElementRules[element];
		for (const attunement of attunements) {
			switch (true) {
				case attunement in relationships.absorbs:
					absorbed += 1;
					break;
				case attunement in relationships.immuneTo:
					blocked = true;
					break;
				case attunement in relationships.resists:
					const after = minClamped(damage, 1, 0)
					damage = after[0];
					break;
				case attunement in relationships.weakTo:
					damage += 1;
					break;
			}
		}
		switch (true) {
			case absorbed > 0:
				args.absorbs = absorbed;
				break;
			case blocked:
				args.calculatedDamage = 0;
				break;
			default:
				args.calculatedDamage = damage;
				break;
		}
	}
	return args;
}

export function resolveDamage (
	args: OperationContext
): OperationResult {
	const target = args.targetEntity;
	const damage = args.calculatedDamage;
	if (target && damage) {
		if (damage > 0) {
			const now = target.hp;
			const minus = -1 * damage;
			const after = minClamped(now, minus, 0);
			const extra = after[1];
			target.hp = after[0];
			if (extra > 0) {
				// TODO: EmitSignal Overkill
			}
			switch (true) {
				case target.hp === 0:
					// TODO: EmitSignal Entity Death
					break;
				case target.hp < target.maxHp / 2:
					if (target.statusTurns['wound'] > 0) {
						openWounds(args);
					}
					break;
				default:
					break;
			}
		}
	}
	return { breaks: false };
}

