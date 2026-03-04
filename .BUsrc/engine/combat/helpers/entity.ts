// src/engine/combat/helpers/entity.ts

import { CombatEntity } from '../../interfaces/entity.ts';

export function currentAttunements (
	target: CombatEntity
): Array<string> {
	const attunements = 
		Object.keys(target.attunedTo)
	.filter((key) => target.attunedTo[
		key as keyof typeof target.attunedTo
	]);
	return attunements;
}

export function currentStatuses (
	target: CombatEntity
): Array<string> {
	const statuses =
		Object.keys(target.hasStatus)
	.filter((key) => target.hasStatus[
		key as keyof typeof target.hasStatus
	]);
	return statuses;
}

