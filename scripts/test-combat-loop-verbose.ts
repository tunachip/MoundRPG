import { createAiActions, createAiProfile, createCombatState, executeCombatTurn } from '../src/combat/index.ts';
import { getEncounterDefinition } from '../src/content/encounters/index.ts';
import { createEncounterEntityFromDefinition } from '../src/world/index.ts';

const DEFAULT_TURN_DELAY_MS = 650;
const DEFAULT_PHASE_DELAY_MS = 250;
const MAX_TURNS = 50;

async function main (): Promise<void> {
	const speed = parsePlaybackArgs();
	const turnDelayMs = speed.turnDelayMs;
	const phaseDelayMs = speed.phaseDelayMs;

	const leftDefinition = getEncounterDefinition(0);
	const rightDefinition = getEncounterDefinition(0);

	const leftEntity = createEncounterEntityFromDefinition(leftDefinition);
	leftEntity.name = 'AI Left';

	const rightEntity = createEncounterEntityFromDefinition(rightDefinition);
	rightEntity.name = 'AI Right';

	const combat = createCombatState(leftEntity, [rightEntity]);
	const leftIndex = 0;
	const rightIndex = 1;
	const leftProfile = createAiProfile(leftDefinition.temper);
	const rightProfile = createAiProfile(rightDefinition.temper);

	printBanner('AI VS AI COMBAT TEST');
	printLine(`Left:  ${leftLabel(combat.entities[leftIndex].name)} (${leftDefinition.temper})`);
	printLine(`Right: ${rightLabel(combat.entities[rightIndex].name)} (${rightDefinition.temper})`);
	printLine(`Speed: turnDelay=${turnDelayMs}ms, phaseDelay=${phaseDelayMs}ms`);
	printLine('');
	await sleep(phaseDelayMs);

	while (bothAlive(combat, leftIndex, rightIndex) && combat.turn < MAX_TURNS) {
		const displayedTurn = combat.turn + 1;
		printBanner(`TURN ${displayedTurn}`);
		printEntitySnapshot(combat, leftIndex, rightIndex, 'Before Decisions');

		const leftActions = createAiActions(combat, leftIndex, leftProfile);
		const rightActions = createAiActions(combat, rightIndex, rightProfile);

		printLine('Decisions:');
		printLine(`  ${leftLabel(combat.entities[leftIndex].name)}: ${formatActions(combat, leftActions)}`);
		printLine(`  ${rightLabel(combat.entities[rightIndex].name)}: ${formatActions(combat, rightActions)}`);
		await sleep(phaseDelayMs);

		const before = snapshotState(combat, leftIndex, rightIndex);
		const result = executeCombatTurn(combat, {
			[leftIndex]: leftActions,
			[rightIndex]: rightActions,
		});
		const after = snapshotState(combat, leftIndex, rightIndex);

		printLine(`Turn Order: ${result.order.map((index) => formatEntityByIndex(combat, index, leftIndex, rightIndex)).join(' -> ')}`);
		printDiff(before, after);
		printEntitySnapshot(combat, leftIndex, rightIndex, 'After Execution');

		if (!bothAlive(combat, leftIndex, rightIndex)) {
			break;
		}
		await sleep(turnDelayMs);
	}

	printBanner('RESULT');
	const left = combat.entities[leftIndex];
	const right = combat.entities[rightIndex];
	if (left.hp <= 0 && right.hp <= 0) {
		printLine('Draw: both entities died.');
	} else if (left.hp <= 0) {
		printLine(`Winner: ${rightLabel(right.name)}`);
	} else if (right.hp <= 0) {
		printLine(`Winner: ${leftLabel(left.name)}`);
	} else {
		printLine(`No winner after ${MAX_TURNS} turns.`);
	}
	printLine(`Final HP -> ${leftLabel(left.name)}: ${left.hp}, ${rightLabel(right.name)}: ${right.hp}`);
}

function bothAlive (
	combat: ReturnType<typeof createCombatState>,
	leftIndex: number,
	rightIndex: number,
): boolean {
	return combat.entities[leftIndex].hp > 0 && combat.entities[rightIndex].hp > 0;
}

function formatActions (
	combat: ReturnType<typeof createCombatState>,
	actions: ReturnType<typeof createAiActions>,
): string {
	if (actions.length === 0) {
		return 'No actions';
	}
	return actions
		.map((action) => {
			if (!action.move || action.move.type !== 'move') {
				return `[${action.chainIndex}] ${action.type}`;
			}
			const move = combat.moves[action.move.index];
			const targetLabel = action.targets
				.map((target) => target.type === 'entity' ? combat.entities[target.index]?.name : `${target.type}#${target.index}`)
				.join(', ');
			const suffix = targetLabel ? ` -> ${targetLabel}` : '';
			return `[${action.chainIndex}] ${action.type} ${move?.name ?? `move#${action.move.index}`}${suffix}`;
		})
		.join(' | ');
}

function snapshotState (
	combat: ReturnType<typeof createCombatState>,
	leftIndex: number,
	rightIndex: number,
): Record<string, number> {
	return {
		leftHp: combat.entities[leftIndex].hp,
		leftEnergy: combat.entities[leftIndex].energy,
		rightHp: combat.entities[rightIndex].hp,
		rightEnergy: combat.entities[rightIndex].energy,
	};
}

function printDiff (
	before: Record<string, number>,
	after: Record<string, number>,
): void {
	const diffs = [
		diffLabel('Left HP', before.leftHp, after.leftHp),
		diffLabel('Left Energy', before.leftEnergy, after.leftEnergy),
		diffLabel('Right HP', before.rightHp, after.rightHp),
		diffLabel('Right Energy', before.rightEnergy, after.rightEnergy),
	].filter((line) => line !== null);

	if (diffs.length === 0) {
		printLine('Changes: none');
		return;
	}
	printLine('Changes:');
	for (const line of diffs) {
		printLine(`  ${line}`);
	}
}

function diffLabel (
	label: string,
	before: number,
	after: number,
): string | null {
	if (before === after) {
		return null;
	}
	const delta = after - before;
	const sign = delta > 0 ? '+' : '';
	const coloredDelta = delta > 0 ? green(`${sign}${delta}`) : red(`${delta}`);
	return `${label}: ${before} -> ${after} (${coloredDelta})`;
}

function printEntitySnapshot (
	combat: ReturnType<typeof createCombatState>,
	leftIndex: number,
	rightIndex: number,
	title: string,
): void {
	const left = combat.entities[leftIndex];
	const right = combat.entities[rightIndex];
	printLine(`${title}:`);
	printLine(`  ${leftLabel(left.name)}: HP ${left.hp}/${left.maxHp}, Energy ${left.energy}/${left.maxEnergy}`);
	printLine(`  ${rightLabel(right.name)}: HP ${right.hp}/${right.maxHp}, Energy ${right.energy}/${right.maxEnergy}`);
}

function printBanner (label: string): void {
	printLine(`\n=== ${label} ===`);
}

function printLine (line: string): void {
	process.stdout.write(`${line}\n`);
}

function sleep (ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

interface PlaybackArgs {
	turnDelayMs: number;
	phaseDelayMs: number;
}

function parsePlaybackArgs (): PlaybackArgs {
	const speedArg = process.argv[2];
	const turnDelayArg = process.argv[3];
	const phaseDelayArg = process.argv[4];
	const speedMultiplier = toPositiveNumber(speedArg, 1);
	const explicitTurnDelay = toPositiveNumber(turnDelayArg);
	const explicitPhaseDelay = toPositiveNumber(phaseDelayArg);

	return {
		turnDelayMs: explicitTurnDelay ?? Math.round(DEFAULT_TURN_DELAY_MS * speedMultiplier),
		phaseDelayMs: explicitPhaseDelay ?? Math.round(DEFAULT_PHASE_DELAY_MS * speedMultiplier),
	};
}

function toPositiveNumber (
	value: string | undefined,
	fallback?: number,
): number | undefined {
	if (value === undefined) {
		return fallback;
	}
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}
	return parsed;
}

function formatEntityByIndex (
	combat: ReturnType<typeof createCombatState>,
	index: number,
	leftIndex: number,
	rightIndex: number,
): string {
	const name = combat.entities[index]?.name ?? `entity#${index}`;
	if (index === leftIndex) {
		return leftLabel(name);
	}
	if (index === rightIndex) {
		return rightLabel(name);
	}
	return name;
}

function leftLabel (text: string): string {
	return yellow(text);
}

function rightLabel (text: string): string {
	return cyan(text);
}

function yellow (text: string): string {
	return color(text, 33);
}

function cyan (text: string): string {
	return color(text, 36);
}

function green (text: string): string {
	return color(text, 32);
}

function red (text: string): string {
	return color(text, 31);
}

function color (
	text: string,
	code: number,
): string {
	return `\u001b[${code}m${text}\u001b[0m`;
}

await main();
