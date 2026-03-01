import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { compileMoveFile, parseMoveFile } from '../src/compiler/moveCompiler.ts';

const fixtureMap = loadExpectedMoves();

function main(): void {
	const fixturesDir = path.resolve('docs/pseudo_moves');
	const outputDir = path.resolve('src/data/moves/generated');

	fs.rmSync(outputDir, { recursive: true, force: true });
	fs.mkdirSync(outputDir, { recursive: true });

	for (const fileName of fixtureMap.keys()) {
		const inputPath = path.join(fixturesDir, fileName);
		const outputPath = path.join(outputDir, fileName.replace(/\.move$/, '.ts'));
		const parsedMove = parseMoveFile(fs.readFileSync(inputPath, 'utf8'), inputPath).move;
		const expectedMove = JSON.parse(JSON.stringify(fixtureMap.get(fileName)));

		assert.deepStrictEqual(parsedMove, expectedMove, `Parsed move mismatch for ${fileName}`);
		compileMoveFile(inputPath, outputPath);
		assert.ok(fs.existsSync(outputPath), `Missing compiled output for ${fileName}`);
	}

	process.stdout.write('move compiler test passed\n');
}

function loadExpectedMoves(): Map<string, unknown> {
	const sourcePath = path.resolve('src/data/moves/examples.ts');
	const source = fs.readFileSync(sourcePath, 'utf8');
	const objectMatches = [...source.matchAll(/export const (\w+): MoveTemplate = (\{[\s\S]*?\n\})/g)];
	const moveByName = new Map<string, unknown>();

	for (const match of objectMatches) {
		const literal = match[2];
		const value = vm.runInNewContext(`(${literal})`);
		moveByName.set(String((value as { name?: string }).name), value);
	}

	return new Map([
		['roll_tide.move', moveByName.get('Roll Tide')],
		['stone_toss.move', moveByName.get('Stone Toss')],
		['mistify.move', moveByName.get('Mistify')],
	]);
}

main();
