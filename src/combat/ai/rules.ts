// src/combat/ai/rules.ts

import type { Actor } from '../../actor/types.ts';
import type { TemperamentTag } from '../../content/encounters/types.ts';
import { getDamageRules } from '../../shared/damageRules.ts';
import type { DamageElement } from '../../shared/types.ts';
import type { CombatState, CombatEntity, CombatMove } from '../state/index.ts';
import type { Operation } from '../operation/types.ts';

export interface AiRuleContext {
	combat: CombatState;
	caster: CombatEntity;
	enemyTargets: Array<Actor>;
	move: CombatMove;
	intent: 'activate' | 'cast';
	chainIndex: number;
}

type TemperamentRule = (ctx: AiRuleContext) => number;

export const TemperamentRules: Record<TemperamentTag, TemperamentRule> = {
	utilitarian: ({ move }) => move.type === 'utility' ? 2 : -0.5,
	aggressive: ({ move }) => move.type === 'attack' ? 2.5 : -0.4,
	'health-conscious': ({ intent, move }) => hasSelfSustainOperation(resolveOperations(move, intent)) ? 2 : 0,
	'multi-tasker': ({ intent, chainIndex }) => {
		if (intent === 'activate') {
			return chainIndex === 0 ? 1.5 : 0.5;
		}
		return chainIndex > 0 ? 1.2 : 0.2;
	},
	tactical: (ctx) => scoreAttackPressure(ctx.combat, ctx.enemyTargets, ctx.move.element) * 1.5
		+ scoreDefensePressure(ctx.combat, ctx.caster, ctx.move.element) * 0.5,
	stately: ({ intent, move }) => hasSelfApplyStatus(resolveOperations(move, intent)) ? 2 : 0,
	defensive: (ctx) => scoreDefensePressure(ctx.combat, ctx.caster, ctx.move.element),
	offensive: (ctx) => scoreAttackPressure(ctx.combat, ctx.enemyTargets, ctx.move.element)
		+ (ctx.move.type === 'attack' ? 1 : -0.2),
	explosive: (ctx) => {
		if (ctx.caster.energy >= 3) {
			return scoreAttackPressure(ctx.combat, ctx.enemyTargets, ctx.move.element)
				+ (ctx.intent === 'cast' ? 1 : 0);
		}
		return scoreDefensePressure(ctx.combat, ctx.caster, ctx.move.element);
	},
	earlybird: (ctx) => {
		if (ctx.combat.turn < 3) {
			return scoreAttackPressure(ctx.combat, ctx.enemyTargets, ctx.move.element) + 0.7;
		}
		return scoreDefensePressure(ctx.combat, ctx.caster, ctx.move.element) + 0.7;
	},
	frugal: ({ chainIndex }) => chainIndex > 0 ? -1.5 : 0.5,
	spendthrift: ({ chainIndex }) => chainIndex > 0 ? 1.5 : 0.2,
};

export function scoreByTemperament (
	temperament: TemperamentTag,
	ctx: AiRuleContext,
): number {
	return TemperamentRules[temperament](ctx);
}

export function scoreAttackPressure (
	combat: CombatState,
	enemyTargets: Array<Actor>,
	element: DamageElement,
): number {
	let score = 0;
	const rules = getDamageRules(element);
	for (const target of enemyTargets) {
		const enemy = combat.entities[target.index];
		for (const weak of rules.weakTo) {
			if (enemy.attunedTo[weak]) {
				score += 1.5;
			}
		}
		for (const blockedBy of rules.blocks) {
			if (enemy.attunedTo[blockedBy]) {
				score -= 2;
			}
		}
		for (const resistedBy of rules.resists) {
			if (enemy.attunedTo[resistedBy]) {
				score -= 0.8;
			}
		}
	}
	return score;
}

export function expandDynamicPriorities (
	priorities: Array<TemperamentTag>,
	combat: CombatState,
	caster: CombatEntity,
): Array<TemperamentTag> {
	const expanded = [...priorities];
	for (const temperament of priorities) {
		if (temperament === 'explosive') {
			expanded.push(caster.energy >= 3 ? 'offensive' : 'defensive');
		}
		if (temperament === 'earlybird') {
			expanded.push(combat.turn < 3 ? 'offensive' : 'defensive');
		}
	}
	return expanded;
}

export function priorityWeight (
	index: number,
): number {
	const weight = 1 - (index * 0.15);
	return Math.max(0.2, weight);
}

function scoreDefensePressure (
	combat: CombatState,
	caster: CombatEntity,
	element: DamageElement,
): number {
	let score = 0;
	const enemyAttackElements = findEnemyActiveAttackElements(combat, caster.index);
	for (const enemyElement of enemyAttackElements) {
		const rules = getDamageRules(enemyElement);
		if (rules.blocks.includes(element)) {
			score += 2;
		}
		if (rules.absorbs.includes(element)) {
			score += 1.5;
		}
		if (rules.resists.includes(element)) {
			score += 1;
		}
		if (rules.weakTo.includes(element)) {
			score -= 0.5;
		}
	}
	return score;
}

function findEnemyActiveAttackElements (
	combat: CombatState,
	casterIndex: number,
): Array<DamageElement> {
	const elements: Array<DamageElement> = [];
	for (const entity of combat.entities) {
		if (entity.index === casterIndex || entity.hp <= 0) {
			continue;
		}
		for (const moveIndex of entity.moves) {
			const move = combat.moves[moveIndex];
			if (move?.isActive && move.type === 'attack') {
				elements.push(move.element);
			}
		}
	}
	return elements;
}

function resolveOperations (
	move: CombatMove,
	intent: 'activate' | 'cast',
): Array<Operation> {
	return intent === 'cast' ? move.operations.fromActive : move.operations.fromBanked;
}

function hasSelfSustainOperation (
	operations: Array<Operation>,
): boolean {
	return operations.some((operation) => {
		if (!['heal', 'applyEnergy', 'raiseMaxHp', 'raiseMaxEnergy'].includes(operation.name)) {
			return false;
		}
		const target = typeof operation.args.target === 'string' ? operation.args.target : '';
		return target === 'caster' || target === 'self';
	});
}

function hasSelfApplyStatus (
	operations: Array<Operation>,
): boolean {
	return operations.some((operation) => {
		if (operation.name !== 'applyStatus') {
			return false;
		}
		const target = typeof operation.args.target === 'string' ? operation.args.target : '';
		return target === 'caster' || target === 'self';
	});
}
