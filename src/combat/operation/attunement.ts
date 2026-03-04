// src/combat/operation/attunement.ts

import type { OperationContext, OperationResult } from './types.ts';
import { forEachTargetEntity, requireCtxElement } from './helpers.ts';

export function applyAttunement (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const element = requireCtxElement(ctx, 'applyAttunement');

	forEachTargetEntity(ctx, (target, targetActor) => {
		if (!target.attunedTo[element]) {
			target.attunedTo[element] = true;

			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:attunement:gained',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function negateAttunement (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const element = requireCtxElement(ctx, 'negateAttunement');

	forEachTargetEntity(ctx, (target, targetActor) => {
		if (target.attunedTo[element]) {
			target.turnsAttuned[element] = 0;
			target.attunedTo[element] = false;

			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:attunement:lost',
				actors: [targetActor],
			});
		}
	});
	return result;
}

export function spendAttunement (
	ctx: OperationContext
): OperationResult {
	const result: OperationResult = { breaks: false };
	const element = requireCtxElement(ctx, 'spendAttunement');

	forEachTargetEntity(ctx, (target, targetActor) => {
		if (target.attunedTo[element]) {
			const before = target.turnsAttuned[element];
			target.turnsAttuned[element] = 0;
			target.attunedTo[element] = false;

			result.triggers ??= [];
			result.triggers.push({
				trigger: 'entity:attunement:lost',
				actors: [targetActor],
			});
			result.changes ??= [];
			result.changes.push({
				field: 'entity.attunementTurns',
				before: before,
				after: 0,
			});
		}
	});
	return result;
}
