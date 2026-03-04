// src/shared/constants.ts

export const Statuses = [
	'burn',
	'decay',
	'wound',
	'regen',
	'curse',
	'slow',
	'quick',
	'tough',
	'strong',
	'sleep',
	'stun',
	'anger',
] as const;

export const DamageElements = [
	'water',
	'stone',
	'fire',
	'plant',
	'vital',
	'force',
	'thunder',
] as const;

export const Cultures = [
	'mason',
	'cultivist',
	'nomad',
	'bastard',
] as const;

export const EntityTypes = [
	'player',
	'encounter',
	'elite',
] as const;

export const MoveTypes = [
	'attack',
	'utility',
] as const;

export const Speeds = [
	'slow',
	'normal',
	'quick',
] as const;

export const ActorTypes = [
	'entity',
	'move',
	'blessing',
	'listener',
] as const;

export const EventTriggers = [
	// pre-operation triggers
	// format: 'pre:operationName'
	'pre:applyAttunement',
	'pre:negateAttunement',
	'pre:spendAttunement',
	// pre-event triggers
	// format: 'pre:actor:event'
	'pre:entity:death',
	'pre:entity:attunementBlock',
	'pre:entity:fullHeal',
	'pre:entity:attacked',
	// side effects triggers
	// format: 'actor:field:change'
	'entity:hp:gained',
	'entity:hp:lost',
	'entity:maxHp:raised',
	'entity:maxHp:lowered',
	'entity:energy:gained',
	'entity:energy:lost',
	'entity:maxEnergy:raised',
	'entity:maxEnergy:lowered',
	'entity:attunement:gained',
	'entity:attunement:lost',
	'entity:status:gained',
	'entity:status:lost',
	'entity:maxStatusTurns:raised',
	'entity:maxStatusTurns:lowered',
	'entity:curseRisk:gained',
	'entity:curseRisk:lost',
	'listener:activated',
	'listener:deactivated',
	// post-event triggers
	// format: 'post:actor:event'
	'post:entity:death',
	'post:entity:fullHeal',
	'post:entity:attunementBlock',
	// turn-phase pre-triggers
	// format: 'pre:phase'
	'pre:executeTurn',
] as const;

export const ActionTypes = [
	'activateMove',
	'castMove',
	'focus',
] as const;

export const OpCodes = [
	'attack',
	'heal',
	'raiseMaxHp',
	'lowerMaxHp',
	'applyAttunement',
	'negateAttunement',
	'spendAttunement',
	'applyCurseRisk',
	'reduceCurseRisk',
	'negateCurseRisk',
	'spendCurseRisk',
	'applyEnergy',
	'reduceEnergy',
	'negateEnergy',
	'spendEnergy',
	'raiseMaxEnergy',
	'lowerMaxEnergy',
	'applyStatus',
	'reduceStatus',
	'negateStatus',
	'spendStatus',
	'applyCooldown',
	'reduceCooldown',
	'negateCooldown',
	'spendCooldown',
	'raiseMaxStatusTurns',
	'lowerMaxStatusTurns',
] as const;
