import fs from 'node:fs';
import path from 'node:path';

import { createAiActions, createAiProfile, createCombatState, executeCombatTurn } from '../src/combat/index.ts';
import type { DeclaredAction } from '../src/combat/turn/index.ts';
import { EncounterDefinitionsById } from '../src/content/encounters/index.ts';
import type { EncounterDefinition } from '../src/content/encounters/index.ts';
import { createEncounterEntityFromDefinition } from '../src/world/index.ts';

const OUTPUT_PATH = path.resolve('docs/ai_pair_battle_results.md');
const MAX_TURNS = 60;

interface BattleResult {
	loop: number;
	left: EncounterDefinition;
	right: EncounterDefinition;
	winnerLabel: string;
	winnerId: number | null;
	turns: number;
	leftHp: number;
	rightHp: number;
	history: Array<string>;
}

interface ScoreboardRow {
	encounter: EncounterDefinition;
	battles: number;
	wins: number;
	losses: number;
	draws: number;
	totalTurns: number;
	hpFor: number;
	hpAgainst: number;
}

function main (): void {
	const loops = parseLoopCount(process.argv[2]);
	const encounters = Object.values(EncounterDefinitionsById)
		.sort((left, right) => left.definitionId - right.definitionId);
	const results: Array<BattleResult> = [];

	for (let loop = 1; loop <= loops; loop += 1) {
		for (let i = 0; i < encounters.length; i += 1) {
			for (let j = i + 1; j < encounters.length; j += 1) {
				results.push(runBattle(encounters[i], encounters[j], loop));
			}
		}
	}

	const output = renderReport(results, loops, encounters.length);
	fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

	process.stdout.write(`Wrote ${results.length} pair results across ${loops} loop(s) to ${OUTPUT_PATH}\n`);
}

function runBattle (
	leftDefinition: EncounterDefinition,
	rightDefinition: EncounterDefinition,
	loop: number,
): BattleResult {
	const leftEntity = createEncounterEntityFromDefinition(leftDefinition);
	const rightEntity = createEncounterEntityFromDefinition(rightDefinition);
	leftEntity.name = `${leftDefinition.name} [${leftDefinition.definitionId}]`;
	rightEntity.name = `${rightDefinition.name} [${rightDefinition.definitionId}]`;

	const combat = createCombatState(leftEntity, [rightEntity]);
	const leftIndex = 0;
	const rightIndex = 1;
	const leftProfile = createAiProfile(leftDefinition.tempers);
	const rightProfile = createAiProfile(rightDefinition.tempers);
	const history: Array<string> = [];

	while (
		combat.entities[leftIndex].hp > 0 &&
		combat.entities[rightIndex].hp > 0 &&
		combat.turn < MAX_TURNS
	) {
		const leftActions = createAiActions(combat, leftIndex, leftProfile);
		const rightActions = createAiActions(combat, rightIndex, rightProfile);

		const beforeLeftHp = combat.entities[leftIndex].hp;
		const beforeRightHp = combat.entities[rightIndex].hp;
		const result = executeCombatTurn(combat, {
			[leftIndex]: leftActions,
			[rightIndex]: rightActions,
		});
		const afterLeftHp = combat.entities[leftIndex].hp;
		const afterRightHp = combat.entities[rightIndex].hp;

		history.push(
			[
				`T${combat.turn}`,
				`Order: ${result.order.map((index) => combat.entities[index].name).join(' -> ')}`,
				`${combat.entities[leftIndex].name}: ${formatActions(combat, leftActions)} (HP ${beforeLeftHp} -> ${afterLeftHp})`,
				`${combat.entities[rightIndex].name}: ${formatActions(combat, rightActions)} (HP ${beforeRightHp} -> ${afterRightHp})`,
			].join(' | ')
		);
	}

	const left = combat.entities[leftIndex];
	const right = combat.entities[rightIndex];
	const winnerId =
		left.hp <= 0 && right.hp <= 0
			? null
			: left.hp <= 0
				? rightDefinition.definitionId
				: right.hp <= 0
					? leftDefinition.definitionId
					: null;
	const winnerLabel =
		winnerId === null
			? (combat.turn >= MAX_TURNS ? 'Draw (turn cap)' : 'Draw')
			: (winnerId === leftDefinition.definitionId ? left.name : right.name);

	return {
		loop,
		left: leftDefinition,
		right: rightDefinition,
		winnerLabel,
		winnerId,
		turns: combat.turn,
		leftHp: left.hp,
		rightHp: right.hp,
		history,
	};
}

function formatActions (
	combat: ReturnType<typeof createCombatState>,
	actions: Array<DeclaredAction>,
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
			const targets = action.targets
				.map((target) => target.type === 'entity' ? combat.entities[target.index]?.name : `${target.type}#${target.index}`)
				.join(', ');
			return `[${action.chainIndex}] ${action.type} ${move?.name ?? `move#${action.move.index}`}${targets ? ` -> ${targets}` : ''}`;
		})
		.join(' ; ');
}

function renderReport (
	results: Array<BattleResult>,
	loops: number,
	encounterCount: number,
): string {
	const lines: Array<string> = [];
	const scoreboard = buildScoreboard(results);
	lines.push('# AI Encounter Pair Battle Results');
	lines.push('');
	lines.push(`Generated: ${new Date().toISOString()}`);
	lines.push(`Loops: ${loops}`);
	lines.push(`Encounters: ${encounterCount}`);
	lines.push(`Total Pairings: ${results.length}`);
	lines.push('');
	lines.push('## Scoreboard');
	lines.push('');
	lines.push('| Encounter | Wins | Losses | Draws | Battles | Win Rate | Avg Turns | HP Diff |');
	lines.push('|---|---:|---:|---:|---:|---:|---:|---:|');
	for (const row of scoreboard) {
		const winRate = row.battles === 0 ? 0 : (row.wins / row.battles) * 100;
		const avgTurns = row.battles === 0 ? 0 : row.totalTurns / row.battles;
		const hpDiff = row.hpFor - row.hpAgainst;
		lines.push(
			`| ${row.encounter.name} [${row.encounter.definitionId}] | ${row.wins} | ${row.losses} | ${row.draws} | ${row.battles} | ${winRate.toFixed(1)}% | ${avgTurns.toFixed(2)} | ${hpDiff} |`
		);
	}
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	lines.push('| Loop | Left | Right | Winner | Turns | Final HP (L-R) |');
	lines.push('|---:|---|---|---|---:|---:|');
	for (const result of results) {
		lines.push(
			`| ${result.loop} | ${result.left.name} [${result.left.definitionId}] | ${result.right.name} [${result.right.definitionId}] | ${result.winnerLabel} | ${result.turns} | ${result.leftHp}-${result.rightHp} |`
		);
	}
	lines.push('');
	lines.push('## Battle Histories');
	lines.push('');
	for (const result of results) {
		lines.push(`### Loop ${result.loop}: ${result.left.name} [${result.left.definitionId}] vs ${result.right.name} [${result.right.definitionId}]`);
		lines.push('');
		lines.push(`Winner: ${result.winnerLabel}`);
		lines.push('');
		for (const entry of result.history) {
			lines.push(`- ${entry}`);
		}
		lines.push('');
	}
	return `${lines.join('\n')}\n`;
}

function buildScoreboard (
	results: Array<BattleResult>,
): Array<ScoreboardRow> {
	const rows = new Map<number, ScoreboardRow>();

	for (const result of results) {
		const leftId = result.left.definitionId;
		const rightId = result.right.definitionId;
		const left = getOrCreateRow(rows, result.left);
		const right = getOrCreateRow(rows, result.right);

		left.battles += 1;
		right.battles += 1;
		left.totalTurns += result.turns;
		right.totalTurns += result.turns;
		left.hpFor += result.leftHp;
		left.hpAgainst += result.rightHp;
		right.hpFor += result.rightHp;
		right.hpAgainst += result.leftHp;

		if (result.winnerId === null) {
			left.draws += 1;
			right.draws += 1;
		} else if (result.winnerId === leftId) {
			left.wins += 1;
			right.losses += 1;
		} else if (result.winnerId === rightId) {
			right.wins += 1;
			left.losses += 1;
		}
	}

	return [...rows.values()].sort((left, right) => {
		if (left.wins !== right.wins) {
			return right.wins - left.wins;
		}
		const leftDiff = left.hpFor - left.hpAgainst;
		const rightDiff = right.hpFor - right.hpAgainst;
		if (leftDiff !== rightDiff) {
			return rightDiff - leftDiff;
		}
		return left.encounter.definitionId - right.encounter.definitionId;
	});
}

function getOrCreateRow (
	rows: Map<number, ScoreboardRow>,
	encounter: EncounterDefinition,
): ScoreboardRow {
	const existing = rows.get(encounter.definitionId);
	if (existing) {
		return existing;
	}
	const created: ScoreboardRow = {
		encounter,
		battles: 0,
		wins: 0,
		losses: 0,
		draws: 0,
		totalTurns: 0,
		hpFor: 0,
		hpAgainst: 0,
	};
	rows.set(encounter.definitionId, created);
	return created;
}

function parseLoopCount (
	value: string | undefined,
): number {
	if (!value) {
		return 1;
	}
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return 1;
	}
	return parsed;
}

main();
