import fs from 'node:fs';
import path from 'node:path';

import type { MoveTemplate } from '../engine/templates/move.ts';

type RawLine = {
	indent: number;
	text: string;
};

type MetadataKey =
	| 'NAME'
	| 'TYPE'
	| 'SPEED'
	| 'ELEMENT'
	| 'BASE_DAMAGE'
	| 'BASE_ITERATIONS'
	| 'CAN_CHAIN'
	| 'CAN_BE_CHAINED_INTO';

const ConditionArgs = [
	'OPERATIONS',
	'CONDITIONS',
	'IF',
	'THEN',
	'ELSE',
];

const metadataKeyMap: Record<MetadataKey, keyof MoveTemplate> = {
	NAME:                'name',
	TYPE:                'moveType',
	SPEED:               'moveSpeed',
	ELEMENT:             'element',
	BASE_DAMAGE:         'baseDamage',
	BASE_ITERATIONS:		 'baseIterations',
	CAN_CHAIN:					 'canChain',
	CAN_BE_CHAINED_INTO: 'canBeChainedInto',
};                    

const lifecycleKeyMap = {
	FROM_ACTIVE:			 'fromActive',
	FROM_BANKED:			 'fromBanked',
	FROM_ON_COOLDOWN:  'fromOnCooldown',
	WHILE_ACTIVE:			 'whileActive',
	WHILE_BANKED:			 'whileBanked',
	WHILE_ON_COOLDOWN: 'whileOnCooldown',
} as const;

type OperationMatrixKey = keyof MoveTemplate['operations'];
type Operation = MoveTemplate['operations']['fromActive'] extends Array<infer T> ? T : never;
type OperationMatrix = MoveTemplate['operations'];
type Condition = NonNullable<OperationMatrix['whileActive']>['conditions'][number];
type ConditionalOperations = NonNullable<OperationMatrix['whileActive']>;

export type ParsedMoveFile = {
	move: MoveTemplate;
	sourcePath?: string;
};

export function compileMoveFile(
	inputPath: string,
	outputPath?: string,
	exportName?: string
): string {
	const source = fs.readFileSync(inputPath, 'utf8');
	const move = parseMoveFile(source).move;
	const targetPath = outputPath ?? defaultOutputPath(inputPath);
	const moduleExportName = exportName ?? toExportName(path.basename(targetPath, '.ts'));
	const importPath = getTemplateImportPath(targetPath);
	const output = emitMoveTemplateModule(move, moduleExportName, importPath);

	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
	fs.writeFileSync(targetPath, output);

	return targetPath;
}

export function parseMoveFile(
	source: string,
	sourcePath?: string
): ParsedMoveFile {
	const sections = splitSections(source);
	const notes = parseNotes(sections.NOTES ?? []);
	const metadata = parseMetadata(sections.METADATA ?? []);
	const operations = parseOperations(sections.OPERATIONS ?? []);

	return {
		move: {
			name: metadata.name ?? '',
			devNotes: notes,
			moveType: metadata.moveType ?? 'attack',
			moveSpeed: metadata.moveSpeed ?? 'normal',
			element: metadata.element ?? 'water',
			baseDamage: metadata.baseDamage ?? 0,
			baseIterations: metadata.baseIterations ?? 1,
			canChain: metadata.canChain ?? true,
			canBeChainedInto: metadata.canBeChainedInto ?? true,
			operations,
		},
		sourcePath,
	};
}

export function emitMoveTemplateModule(
	move: MoveTemplate,
	exportName: string,
	importPath = '../../engine/templates/move.ts'
): string {
	const serialized = serializeValue(move, 0);

	r].includeseturn [
		`import { MoveTemplate } from '${importPath}';`,
		'',
		`export const ${exportName}: MoveTemplate = ${serialized};`,
		'',
	].join('\n');
}

export function toExportName(fileStem: string): string {
	const base = fileStem
		.replace(/[^a-zA-Z0-9]+([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase())
		.replace(/^[^a-zA-Z]+/, '');

	return `${base || 'compiledMove'}Move`;
}

function defaultOutputPath (
	inputPath: string
): string {
	const stem = path.basename(inputPath, path.extname(inputPath));
	return path.join(path.dirname(inputPath), `${stem}.ts`);
}

function getTemplateImportPath (
	outputPath: string
): string {
	const templatePath = path.resolve(
		path.dirname(outputPath),
		'../engine/templates/move.ts'
	);
	const repoTemplatePath = path.resolve(
		path.dirname(outputPath),
		relativeEngineTemplatePath(outputPath)
	);
	const chosenPath = fs.existsSync(repoTemplatePath) ? repoTemplatePath : templatePath;
	let relativePath = path.relative(path.dirname(outputPath), chosenPath);
	if (!relativePath.startsWith('.')) {
		relativePath = `./${relativePath}`;
	}
	return relativePath.replace(/\\/g, '/');
}

function relativeEngineTemplatePath(
	outputPath: string
): string {
	const pathParts = path.resolve(outputPath).split(path.sep);
	const srcIndex = pathParts.lastIndexOf('src');
	if (srcIndex === -1) return '../engine/templates/move.ts';
	const outputDirParts = pathParts.slice(0, -1);
	const relativeFromOutput = outputDirParts.slice(srcIndex + 1);
	const ups = relativeFromOutput.map(() => '..');
	return [...ups, 'engine', 'templates', 'move.ts'].join('/');
}

function splitSections(
	source: string
): Record<string, RawLine[]> {
	const sections: Record<string, RawLine[]> = {};
	const lines = source.replace(/\r\n/g, '\n').split('\n');
	let currentSection = '';

	for (const line of lines) {
		const headerMatch = line.trim().match(/^\[([A-Z_]+)\]$/);
		if (headerMatch) {
			currentSection = headerMatch[1];
			sections[currentSection] = [];
			continue;
		}
		
		if (!currentSection) continue;
		const expanded = line.replace(/\t/g, '  ');

		if (!expanded.trim()) continue;
		const indent = expanded.length - expanded.trimStart().length;
		
		sections[currentSection].push({
			indent,
			text: expanded.trim(),
		});
	}
	return sections;
}

function parseNotes(
	lines: RawLine[]
): string {
	return lines.map((line) => line.text).join(' ').trim();
}

function parseMetadata(
	lines: RawLine[]
): Partial<MoveTemplate> {
	const metadata: Partial<MoveTemplate> = {};

	for (const line of lines) {
		const pair = parseKeyValue(line.text);
		if (!pair) continue;

		const key = normalizeLabel(pair.key) as MetadataKey;
		if (!(key in metadataKeyMap)) continue;

		const moveKey = metadataKeyMap[key];
		(metadata as Record<string, unknown>)[moveKey] = parseValue(pair.value);
	}
	return metadata;
}

function parseOperations(lines: RawLine[]): OperationMatrix {
	const operations: OperationMatrix = {};
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		const lifecycleName = normalizeLabel(line.text);
		const lifecycleKey = lifecycleKeyMap[lifecycleName as keyof typeof lifecycleKeyMap];

		if (!lifecycleKey) {
			index += 1;
			continue;
		}

		const blockStart = index + 1;
		index = blockStart;
		while (index < lines.length) {
			const nextLifecycle = lifecycleKeyMap[normalizeLabel(lines[index].text) as keyof typeof lifecycleKeyMap];
			if (lines[index].indent === 0 && nextLifecycle) {
				break;
			}
			index += 1;
		}

		const blockLines = lines.slice(blockStart, index);
		assignLifecycleBlock(operations, lifecycleKey, blockLines);
	}

	return operations;
}

function assignLifecycleBlock(
	operations: OperationMatrix,
	lifecycleKey: OperationMatrixKey,
	blockLines: RawLine[]
): void {
	if (lifecycleKey.startsWith('from')) {
		const parsedOperations = parseOperationList(blockLines);
		if (parsedOperations.length > 0) {
			operations[lifecycleKey] = parsedOperations;
		}
		return;
	}

	const conditionalBlock = parseConditionalOperationsBlock(blockLines);
	if (conditionalBlock.conditions.length > 0 ||
			conditionalBlock.operations.length > 0) {
		operations[lifecycleKey] = conditionalBlock;
	}
}

function parseConditionalOperationsBlock(
	lines: RawLine[]
): ConditionalOperations {
	const conditionsHeading = findHeadingIndex(lines, 'CONDITIONS');
	const operationsHeading = findHeadingIndex(lines, 'OPERATIONS');

	return {
		conditions: conditionsHeading === -1
			? []
			: parseConditionList(
				sliceHeadingBlock(lines, conditionsHeading)
			),
		operations: operationsHeading === -1
			? []
			: parseOperationList(
				sliceHeadingBlock(lines, operationsHeading)
			),
	};
}

function parseOperationList(lines: RawLine[]): Array<Operation> {
	const operations: Array<Operation> = [];
	let index = 0;

	while (index < lines.length) {
		const numbered = parseNumberedItem(lines[index].text);
		if (!numbered) {
			index += 1;
			continue;
		}

		const startIndent = lines[index].indent;
		const childStart = index + 1;
		index = childStart;

		while (index < lines.length) {
			const sibling = parseNumberedItem(lines[index].text);
			if (sibling && lines[index].indent <= startIndent) {
				break;
			}
			index += 1;
		}

		const body = lines.slice(childStart, index);
		operations.push(parseOperationNode(numbered.name, body, startIndent));
	}

	return operations;
}

function parseOperationNode(
	name: string,
	lines: RawLine[],
	parentIndent: number
): Operation {
	const args: Record<string, unknown> = {};
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		const heading = normalizeLabel(line.text);
		if (isOperationHeading(heading)) {
			const {
				blockLines,
				nextIndex
			} = collectPeerBlock(lines, index, parentIndent, ConditionArgs);
			assignOperationHeading(args, heading, blockLines);
			index = nextIndex;
			continue;
		}

		const pair = parseKeyValue(line.text);
		if (pair) {
			args[toArgKey(pair.key)] = parseValue(pair.value);
		}

		index += 1;
	}

	return { name, args };
}

function assignOperationHeading(
	args: Record<string, unknown>,
	heading: string,
	blockLines: RawLine[]
): void {
	switch (heading) {
		case 'OPERATIONS':
			args.operations = parseOperationList(blockLines);
			break;
		case 'CONDITIONS':
			args.conditions = parseConditionList(blockLines);
			break;
		case 'IF':
			args.if = parseIfBlock(blockLines);
			break;
		case 'THEN':
			args.then = parseOperationList(blockLines);
			break;
		case 'ELSE':
			args.else = parseOperationList(blockLines);
			break;
	}
}

function parseIfBlock(
	lines: RawLine[]
): Record<string, unknown> {
	const conditions: Array<Omit<Condition, 'expects'>> = [];
	let expects: unknown;
	let index = 0;

	while (index < lines.length) {
		const numbered = parseNumberedItem(lines[index].text);
		if (numbered) {
			const startIndent = lines[index].indent;
			const childStart = index + 1;
			index = childStart;
			while (index < lines.length) {
				const sibling = parseNumberedItem(lines[index].text);
				if (sibling && lines[index].indent <= startIndent) {
					break;
				}
				const pair = parseKeyValue(lines[index].text);
				if (pair
						&& normalizeLabel(pair.key) === 'EXPECTS'
						&& lines[index].indent === startIndent
				) { break; }
				index += 1;
			}

			const body = lines.slice(childStart, index);
			const condition = parseConditionNode(numbered.name, body);
			conditions.push({
				name: condition.name,
				args: condition.args,
			});
			continue;
		}

		const pair = parseKeyValue(lines[index].text);
		if (pair && normalizeLabel(pair.key) === 'EXPECTS') {
			expects = parseValue(pair.value);
		}

		index += 1;
	}

	return {
		conditions,
		expects,
	};
}

function parseConditionList(
	lines: RawLine[]
): Array<Condition> {
	const conditions: Array<Condition> = [];
	let index = 0;

	while (index < lines.length) {
		const numbered = parseNumberedItem(lines[index].text);
		if (numbered) {
			const startIndent = lines[index].indent;
			const childStart = index + 1;
			index = childStart;

			while (index < lines.length) {
				const sibling = parseNumberedItem(lines[index].text);
				if (sibling && lines[index].indent <= startIndent) {
					break;
				}
				const pair = parseKeyValue(lines[index].text);
				if (pair && normalizeLabel(pair.key) === 'EXPECTS'
						&& lines[index].indent === startIndent
				) { break; }
				index += 1;
			}

			const body = lines.slice(childStart, index);
			const condition = parseConditionNode(numbered.name, body);

			if (index < lines.length) {
				const expectsPair = parseKeyValue(lines[index].text);
				if (expectsPair
						&& normalizeLabel(expectsPair.key) === 'EXPECTS'
				) {
					condition.expects = parseValue(expectsPair.value);
					index += 1;
				}
			}

			conditions.push(condition);
			continue;
		}

		index += 1;
	}

	return conditions;
}

function parseConditionNode(
	name: string,
	lines: RawLine[]
): Condition {
	const args: Record<string, unknown> = {};
	let expects: unknown;

	for (const line of lines) {
		const pair = parseKeyValue(line.text);
		if (!pair) {
			continue;
		}

		if (normalizeLabel(pair.key) === 'EXPECTS') {
			expects = parseValue(pair.value);
			continue;
		}

		args[toArgKey(pair.key)] = parseValue(pair.value);
	}

	return {
		name,
		args,
		expects,
	};
}

function findHeadingIndex(
	lines: RawLine[],
	heading: string
): number {
	return lines.findIndex((line) => normalizeLabel(line.text) === heading);
}

function sliceHeadingBlock(
	lines: RawLine[],
	headingIndex: number
): RawLine[] {
	const headingLine = lines[headingIndex];
	const peerHeadings = new Set(['CONDITIONS', 'OPERATIONS']);
	let endIndex = headingIndex + 1;

	while (endIndex < lines.length) {
		const heading = normalizeLabel(lines[endIndex].text);
		if (lines[endIndex].indent <= headingLine.indent
				&& peerHeadings.has(heading)
		) {
			break;
		}
		endIndex += 1;
	}

	return lines.slice(headingIndex + 1, endIndex);
}

function collectPeerBlock(
	lines: RawLine[],
	startIndex: number,
	parentIndent: number,
	peerHeadings: Array<string>
): { blockLines: RawLine[]; nextIndex: number } {
	const startLine = lines[startIndex];
	let endIndex = startIndex + 1;

	while (endIndex < lines.length) {
		const heading = normalizeLabel(lines[endIndex].text);
		if (lines[endIndex].indent <= parentIndent) {
			break;
		}
		if (lines[endIndex].indent === startLine.indent
				&& peerHeadings.includes(heading)) {
			break;
		}
		endIndex += 1;
	}

	return {
		blockLines: lines.slice(startIndex + 1, endIndex),
		nextIndex: endIndex,
	};
}

function isOperationHeading(
	label: string
): boolean {
	return ConditionArgs.includes(label);
}

function parseNumberedItem(
	text: string
): { name: string } | null {
	const match = text.match(/^\d+\.\s*(.+)$/);
	if (!match) {
		return null;
	}
	return { name: match[1].trim() };
}

function parseKeyValue(
	text: string
): { key: string; value: string } | null {
	if (text.includes(':')) {
		const colonMatch = text.match(/^([A-Z_ \t]+):\s*(.+)$/);
		if (!colonMatch) {
			return null;
		}
		return {
			key: colonMatch[1],
			value: colonMatch[2].trim(),
		};
	}

	const columns = text.split(/\s{2,}/).map((part) => part.trim()).filter(Boolean);
	if (columns.length < 2) {
		return null;
	}

	return {
		key: columns.slice(0, -1).join(''),
		value: columns[columns.length - 1],
	};
}

function normalizeLabel(
	label: string
): string {
	return label.replace(/[^A-Z_]/gi, '').toUpperCase();
}

function toArgKey(
	key: string
): string {
	const normalized = normalizeLabel(key).toLowerCase();
	return normalized.replace(
		/_([a-z])/g,(_, char: string) => char.toUpperCase());
}

function parseValue(value: string): unknown {
	if (value === 'true') return true; 
	if (value === 'false') return false; 
	if (/^-?\d+(\.\d+)?$/.test(value)) {
		return Number(value);
	}
	if (/^(caster|choice|this)(\.[a-zA-Z_][\w]*)*$/.test(value)) {
		return `$${value}`;
	}
	return value;
}

function serializeValue(value: unknown, depth: number): string {
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const indent = '\t'.repeat(depth + 1);
		const closingIndent = '\t'.repeat(depth);
		// What the fuck
		return `[\n${value.map((item) => `${indent}${serializeValue(item, depth + 1)}`).join(',\n')}\n${closingIndent}]`;
	}

	if (value && typeof value === 'object') {
		const entries = Object.entries(value)
		.filter(([, entryValue]) => entryValue !== undefined);
		
		if (entries.length === 0) return '{}'; 

		const indent = '\t'.repeat(depth + 1);
		const closingIndent = '\t'.repeat(depth);

		return `{\n${entries
			.map(([key, entryValue]) => `${indent}${formatObjectKey(key)}: ${serializeValue(entryValue, depth + 1)}`)
			.join(',\n')}\n${closingIndent}}`;
	}

	if (typeof value === 'string') {
		return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
	}

	return String(value);
}

function formatObjectKey(
	key: string
): string {
	return /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`;
}
