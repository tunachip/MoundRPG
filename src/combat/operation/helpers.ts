// src/combat/operation/helpers.ts

import { CombatState, CombatEntity, CombatMove, CombatBlessing, Listener } from '../state';
import { Actor } from '../../actor';
import { DamageElement, Status } from '../../shared';
import { OperationContext } from './types.ts';

export function requireCombatEntity (
	combat: CombatState,
	actor: Actor,
): CombatEntity {
	if (actor.type !== 'entity') {
		throw new Error(`Expected entity target, got ${actor.type}`)
	}
	const entity = combat.entities[actor.index];
	if (!entity) {
		throw new Error(`Unknown Entity Index: ${actor.index}`)
	}
	return entity;
}

export function requireCombatMove (
	combat: CombatState,
	actor: Actor,
): CombatMove {
	if (actor.type !== 'move') {
		throw new Error(`Expected move target, got ${actor.type}`)
	}
	const move = combat.moves[actor.index];
	if (!move) {
		throw new Error(`Unknown Move Index: ${actor.index}`)
	}
	return move;
}

export function requireCombatBlessing (
	combat: CombatState,
	actor: Actor,
): CombatBlessing {
	if (actor.type !== 'blessing') {
		throw new Error(`Expected blessing target, got ${actor.type}`)
	}
	const blessing = combat.blessings[actor.index];
	if (!blessing) {
		throw new Error(`Unknown Blessing Index: ${actor.index}`)
	}
	return blessing;
}

export function requireListener (
	combat: CombatState,
	actor: Actor,
): Listener {
		if (actor.type !== 'listener') {
		throw new Error(`Expected listener target, got ${actor.type}`)
	}
	const listener = combat.listeners[actor.index];
	if (!listener) {
		throw new Error(`Unknown Listener Index: ${actor.index}`)
	}
	return listener;
}

export function requireCtxElement (
	ctx: OperationContext,
	operationName: string,
): DamageElement {
	if (!ctx.element) {
		throw new Error(`${operationName} requires ctx.element.`);
	}
	return ctx.element;
}

export function requireCtxStatus (
	ctx: OperationContext,
	operationName: string,
): Status {
	if (!ctx.status) {
		throw new Error(`${operationName} requires ctx.status.`);
	}
	return ctx.status;
}

export function requireCtxAmount (
	ctx: OperationContext,
	operationName: string,
): number {
	if (ctx.amount === undefined) {
		throw new Error(`${operationName} requires ctx.amount.`);
	}
	return ctx.amount;
}

export function requireCtxBaseDamage (
	ctx: OperationContext,
	operationName: string,
): number {
	if (ctx.baseDamage === undefined) {
		throw new Error(`${operationName} requires ctx.baseDamage.`);
	}
	return ctx.baseDamage;
}

export function requireCtxCalculatedDamage (
	ctx: OperationContext,
	operationName: string,
): number {
	if (ctx.calculatedDamage === undefined) {
		throw new Error(`${operationName} requires ctx.calculatedDamage.`);
	}
	return ctx.calculatedDamage;
}

export function forEachTargetEntity (
	ctx: OperationContext,
	callback: (entity: CombatEntity, targetActor: Actor) => void,
): void {
	for (const targetActor of ctx.targets) {
		callback(requireCombatEntity(ctx.combat, targetActor), targetActor);
	}
}

export function forEachTargetMove (
	ctx: OperationContext,
	callback: (entity: CombatMove, targetActor: Actor) => void,
): void {
	for (const targetActor of ctx.targets) {
		callback(requireCombatMove(ctx.combat, targetActor), targetActor);
	}
}

export function forEachTargetBlessing (
	ctx: OperationContext,
	callback: (entity: CombatBlessing, targetActor: Actor) => void,
): void {
	for (const targetActor of ctx.targets) {
		callback(requireCombatBlessing(ctx.combat, targetActor), targetActor);
	}
}

export function forEachTargetListener (
	ctx: OperationContext,
	callback: (entity: Listener, targetActor: Actor) => void,
): void {
	for (const targetActor of ctx.targets) {
		callback(requireListener(ctx.combat, targetActor), targetActor);
	}
}
