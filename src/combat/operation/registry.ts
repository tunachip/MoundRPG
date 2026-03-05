// src/combat/operation/registry.ts

import type { OpCode } from '../../shared/types.ts';
import { attack } from './attack.ts';
import { heal, raiseMaxHp, lowerMaxHp } from './health.ts';
import { applyAttunement, negateAttunement, spendAttunement } from './attunement.ts';
import { applyCurseRisk, reduceCurseRisk, negateCurseRisk, spendCurseRisk } from './curse.ts';
import { applyEnergy, reduceEnergy, negateEnergy, spendEnergy, raiseMaxEnergy, lowerMaxEnergy } from './energy.ts';
import { applyStatus, reduceStatus, negateStatus, spendStatus, raiseMaxStatusTurns, lowerMaxStatusTurns } from './status.ts';
import { applyCooldown, reduceCooldown, negateCooldown, spendCooldown } from './cooldown.ts';
import type { OperationContext, OperationResult } from './types.ts';

type OperationExecutor = (ctx: OperationContext) => OperationResult;

const OperationExecutors: Record<OpCode, OperationExecutor> = {
	attack,
	heal,
	raiseMaxHp,
	lowerMaxHp,
	applyAttunement,
	negateAttunement,
	spendAttunement,
	applyCurseRisk,
	reduceCurseRisk,
	negateCurseRisk,
	spendCurseRisk,
	applyEnergy,
	reduceEnergy,
	negateEnergy,
	spendEnergy,
	raiseMaxEnergy,
	lowerMaxEnergy,
	applyStatus,
	reduceStatus,
	negateStatus,
	spendStatus,
	applyCooldown,
	reduceCooldown,
	negateCooldown,
	spendCooldown,
	raiseMaxStatusTurns,
	lowerMaxStatusTurns,
};

export function executeOperationByCode (
	code: OpCode,
	ctx: OperationContext,
): OperationResult {
	return OperationExecutors[code](ctx);
}
