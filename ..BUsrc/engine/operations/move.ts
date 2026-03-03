// src/engine/operations/move.ts

import { OperationContext, OperationResult } from '../interfaces/operation.ts';
import { logEvent } from '../log.ts';

export function activateMove (
	args: OperationContext
): OperationResult {
	const target = args.targetMove;
	const combat = args.combat;
	if (target) {
		const owner = combat.entities[target.ownerIndex];
		switch (true) {
			case target.isActive:
				logEvent(
					`Activate Move ${target.name}`, 'FAILED',
					`${target.name} is Active.`
				);
				break;
		  case target.isBound:
				logEvent(
					`Activate Move ${target.name}`, 'FAILED',
					`${target.name} is Bound.`
				);
				break;
			case owner.ownedMoves.length > 3:
				logEvent(
					`Activate Move ${target.name}`, 'FAILED',
					`${owner.name} already has 4 Active Moves.`
				);
				break;
			default:
				target.isActive = true;
				if (target.isHidden) {
					revealMove(args);
				}
				break;
		}
	}
	return { breaks: false };
}

export function deactivateMove (
	args: OperationContext
): OperationResult {
	const target = args.targetMove;
	if (target) {
		switch (true) {
			case !target.isActive:
				logEvent(
					`Deactivate Move ${target.name}`, 'FAILED',
					`${target.name} is Inactive.`
				);
				break;
		  case target.isBound:
				logEvent(
					`Deactivate Move ${target.name}`, 'FAILED',
					`${target.name} is Bound.`
				);
				break;
			default:
				target.isActive = false;
				break;
		}
	}
	return { breaks: false };
}

export function revealMove (
	args: OperationContext
): OperationResult {
	const target = args.targetMove;
	if (target) {
		switch (target.isHidden) {
			case true:
				target.isHidden = false;
				break;
			case false:
				logEvent(
					`Reveal Move ${target.name}`, 'FAILED',
					`${target.name} is not Hidden.`
				);
				break;
		}
	}
	return { breaks: false };
}

export function hideMove (
	args: OperationContext
): OperationResult {
	const target = args.targetMove;
	if (target) {
		switch (target.isHidden) {
			case true:
				logEvent(
					`Hide Move ${target.name}`, 'FAILED',
					`${target.name} is Hidden.`
				);
				break;
			case false:
				target.isHidden = true;
				break;
		}
	}
	return { breaks: false };
}

