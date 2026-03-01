// src/data/moves/index.ts

import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MoveTemplate } from '../../engine/templates/move.ts';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
let moveIndexPromise: Promise<Array<MoveTemplate>> | null = null;

function isMoveTemplate (
	value: unknown
): value is MoveTemplate {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const move = value as Partial<MoveTemplate>;
	return (
		typeof move.name === 'string' &&
		typeof move.moveType === 'string' &&
		typeof move.moveSpeed === 'string' &&
		typeof move.element === 'string' &&
		typeof move.baseDamage === 'number' &&
		typeof move.baseIterations === 'number' &&
		typeof move.canChain === 'boolean' &&
		typeof move.canBeChainedInto === 'boolean' &&
		typeof move.operations === 'object'
	);
}

async function loadMoveIndex (): Promise<Array<MoveTemplate>> {
	const entries = await readdir(moduleDirectory, { withFileTypes: true });
	const moveFiles = entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((fileName) => fileName.endsWith('.ts'))
		.filter((fileName) => fileName !== 'index.ts')
		.filter((fileName) => fileName !== 'examples.ts')
		.sort();

	const modules = await Promise.all(
		moveFiles.map((fileName) =>
			import(pathToFileURL(join(moduleDirectory, fileName)).href)
		)
	);

	return modules.map((module, index) => {
		const moveTemplate = Object.values(module).find(isMoveTemplate);
		if (!moveTemplate) {
			throw new Error(`Move module "${moveFiles[index]}" does not export a MoveTemplate.`);
		}
		return moveTemplate;
	});
}

export async function getMoveIndex (): Promise<Array<MoveTemplate>> {
	moveIndexPromise ??= loadMoveIndex();
	return moveIndexPromise;
}

export async function getMoveTemplate (
	templateId: number
): Promise<MoveTemplate> {
	const moveIndex = await getMoveIndex();
	const moveTemplate = moveIndex[templateId];
	if (!moveTemplate) {
		throw new Error(`Unknown move templateId: ${templateId}`);
	}
	return moveTemplate;
}
