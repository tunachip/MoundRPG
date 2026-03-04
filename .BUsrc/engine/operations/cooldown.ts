// src/engine/operations/cooldown.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { minClamped } from '../helpers.ts';
import { logEvent } from '../log.ts';

export function applyCooldown (
	args: OperationContext
): OperationResult {
	const target = args.targetMove ?? args.targetBlessing;
	const turns = args.turns ?? 0;
	if (target) {
		const now = target.cooldownTurns;
		switch (now) {
			case -1:
				logEvent(
					`Apply Cooldown to ${target.name}`, 'FAILED',
					`${target.name} is on Perpetual Cooldown.`
				);
				break;
			default:
				target.cooldownTurns = now + turns;
				break;
		}
	}
	return { breaks: false };
}

export function reduceCooldown (
	args: OperationContext
): OperationResult {
	const target = args.targetMove ?? args.targetBlessing;
	const turns = args.turns ?? 0;
	if (target) {
		const now = target.cooldownTurns;
		switch (now) {
			case -1:
				logEvent(
					`Reduce Cooldown of ${target.name}`, 'FAILED',
					`${target.name} is on Perpetual Cooldown.`
				);
				break;
			case 0:
				logEvent(
					`Reduce Cooldown of ${target.name}`, 'FAILED',
					`${target.name} is not on Cooldown.`
				);
				break;
			default: {
				const after = minClamped(0, now, turns);
				target.cooldownTurns = after[0];
				break;
			}
		}
	}
	return { breaks: false };
}

export function negateCooldown (
	args: OperationContext
): OperationResult {
	const target = args.targetMove ?? args.targetBlessing;
	if (target) {
		const now = target.cooldownTurns;
		switch (now) {
			case 0:
				logEvent(
					`Negate Cooldown of ${target.name}`, 'FAILED',
					`${target.name} is not on Cooldown.`
				);
				break;
			default:
				target.cooldownTurns = 0;
				break;
		}
	}
	return { breaks: false };
}

export function extendCooldown (
	args: OperationContext
): OperationResult {
	const target = args.targetMove ?? args.targetBlessing;
	const turns = args.turns;
	if (target && turns) {
		const now = target.cooldownTurns;
		switch (now) {
			case -1:
				logEvent(
					`Extend Cooldown of ${target.name}`, 'FAILED',
					`${target.name} is on Perpetual Cooldown.`
				);
				break;
			case 0:
				logEvent(
					`Extend Cooldown of ${target.name}`, 'FAILED',
					`${target.name} is not on Cooldown.`
				);
				break;
			default:
				target.cooldownTurns += turns;
				break;
		}
	}
	return { breaks: false };
}

