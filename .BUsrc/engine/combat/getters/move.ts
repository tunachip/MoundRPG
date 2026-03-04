// src/engine/combat/getters/move.ts

import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ListenerTemplate } from '../../templates/listener.ts';
import { MoveTemplate } from '../../templates/move.ts';
import { MoveListenerTypes } from '../../constants.ts';

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

async function loadMoveIndex (
): Promise<Array<MoveTemplate>> {
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

export async function getMoveIndex (
): Promise<Array<MoveTemplate>> {
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

interface ListenerTemplateGroup {
	whileActive: Array<ListenerTemplate>;
	whileBanked: Array<ListenerTemplate>;
	whileOnCooldown: Array<ListenerTemplate>;
}

export async function getMoveListenerTemplates (
	moveTemplateId: number
): Promise<ListenerTemplateGroup> {
	const data = await getMoveTemplate(moveTemplateId);
	const listenerTemplates: ListenerTemplateGroup = {
		whileActive: [],
		whileBanked: [],
		whileOnCooldown: [],
	};
	for (const listenerType of MoveListenerTypes) {
		listenerTemplates[listenerType] =
			data.operations[listenerType]
				? [{
					trigger: 'turn-phase execute-operations start',
					conditions: data.operations[listenerType].conditions,
					operations: data.operations[listenerType].operations,
			}] :[];
	}
	return listenerTemplates;
}
