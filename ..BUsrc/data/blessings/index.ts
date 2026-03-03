// src/data/blessings/index.ts

import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BlessingTemplate } from '../../engine/templates/blessing.ts';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
let blessingIndexPromise: Promise<Array<BlessingTemplate>> | null = null;

function isBlessingTemplate (
	value: unknown
): value is BlessingTemplate {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const blessing = value as Partial<BlessingTemplate>;
	return (
		typeof blessing.name === 'string' &&
		typeof blessing.devNotes === 'string' &&
		typeof blessing.entityCulture === 'string' &&
		typeof blessing.element === 'string' &&
		Array.isArray(blessing.listeners)
	);
}

async function loadBlessingIndex (
): Promise<Array<BlessingTemplate>> {
	const entries = await readdir(moduleDirectory, { withFileTypes: true });
	const blessingFiles = entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((fileName) => fileName.endsWith('.ts'))
		.filter((fileName) => fileName !== 'index.ts')
		.sort();

	const modules = await Promise.all(
		blessingFiles.map((fileName) =>
			import(pathToFileURL(join(moduleDirectory, fileName)).href)
		)
	);

	return modules.flatMap((module, index) => {
		const blessingTemplates = Object.values(module).filter(isBlessingTemplate);
		if (blessingTemplates.length === 0) {
			throw new Error(`Blessing module "${blessingFiles[index]}" does not export a BlessingTemplate.`);
		}
		return blessingTemplates;
	});
}

export async function getBlessingIndex (
): Promise<Array<BlessingTemplate>> {
	blessingIndexPromise ??= loadBlessingIndex();
	return blessingIndexPromise;
}

export async function getBlessingTemplate (
	templateId: number
): Promise<BlessingTemplate> {
	const blessingIndex = await getBlessingIndex();
	const blessingTemplate = blessingIndex[templateId];
	if (!blessingTemplate) {
		throw new Error(`Unknown blessing templateId: ${templateId}`);
	}
	return blessingTemplate;
}
