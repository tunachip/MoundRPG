// src/engine/constants.ts


// === Element ==================================
export const GameElements = [
	'water',
	'stone',
	'fire',
	'plant',
	'vital',
	'force',
	'thunder',
] as const;

// === Status ===================================
export const Statuses = [
	'burn',
	'decay',
	'wound',
	'regen',
	'curse',
	'quick',
	'slow',
	'strong',
	'tough',
	'sleep',
	'anger',
	'stun',
] as const;

// === Entity ===================================
export const EntityTypes = [
	'player',
	'encounter',
	'fallen',
	'elite',
] as const;

export const EntityCultures = [
	'mason',
	'cultivist',
	'nomad',
	'bastard',
] as const;

// === Move =====================================
export const MoveTypes = [
	'attack',
	'utility',
] as const;

export const MoveSpeeds = [
	'quick',
	'normal',
	'slow',
] as const;

// === Item =====================================
export const ItemTypes = [
	'blessing',
	'fragment',
	'consumable',
] as const;

// === Target ===================================
export const TargetTypes = [
	'entity',
	'move',
	'blessing',
] as const;

// === Listener =================================
export const ListenerSourceTypes = [
	'entity',
	'move',
	'blessing',
	'listener',
	'system'
] as const;

export const MoveListenerTypes = [
	'whileActive',
	'whileBanked',
	'whileOnCooldown'
] as const;

// === Event ====================================
export const EventTriggers = [
	'combat-match start',
	'combat-match end',
	'combat-phase declare-actions start',
	'combat-phase declare-actions end',
	'combat-phase calculate-turn-order start',
	'combat-phase calculate-turn-order end',
	'combat-phase execute-turns start',
	'combat-phase execute-turns end',
	'turn-phase audit-statuses start',
	'turn-phase audit-statuses end',
	'turn-phase tick-attunements start',
	'turn-phase tick-attunements end',
	'turn-phase tick-damage-statuses start',
	'turn-phase tick-damage-statuses end',
	'turn-phase tick-disqualifier-statuses start',
	'turn-phase tick-disqualifier-statuses end',
	'turn-phase execute-operations start',
	'turn-phase execute-operations end',
	'turn-phase tick-static-statuses start',
	'turn-phase tick-static-statuses end',
	'entity gains-attunement',
	'entity gains-status',
	'entity gains-hp',
	'entity hurt-by attack',
	'entity hurt-by burn',
	'entity hurt-by wound',
	'entity hurt-by decay',
	'entity special-event burn-out',
	'entity special-event thousand-cuts',
	'entity special-event turn-skipped',
	'entity special-event dies',
	'move cooldown start',
	'move cooldown end',
	'move activated',
	'move deactivated',
	'move revealed',
	'move hidden',
	'blessing cooldown start',
	'blessing cooldown end',
	'blessing triggered',
	'blessing exhausted',
	'blessing revealed',
	'blessing hidden',
] as const;

