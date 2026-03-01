import fs from 'node:fs';
import path from 'node:path';

import { compileMoveFile, toExportName } from '../src/compiler/moveCompiler.ts';

function main(): void {
	const [, , inputArg = 'docs/pseudo_moves', outputArg = 'src/data/moves/generated'] = process.argv;
	const inputPath = path.resolve(inputArg);
	const outputPath = path.resolve(outputArg);

	const moveFiles = collectMoveFiles(inputPath);
	if (moveFiles.length === 0) {
		throw new Error(`No .move files found at ${inputPath}`);
	}

	for (const moveFile of moveFiles) {
		const relativePath = path.relative(inputPath, moveFile);
		const outputFile = path.join(outputPath, relativePath.replace(/\.move$/i, '.ts'));
		const exportName = toExportName(path.basename(outputFile, '.ts'));
		const writtenPath = compileMoveFile(moveFile, outputFile, exportName);

		process.stdout.write(`${path.relative(process.cwd(), writtenPath)}\n`);
	}
}

function collectMoveFiles(targetPath: string): Array<string> {
	const stats = fs.statSync(targetPath);

	if (stats.isFile()) {
		return targetPath.endsWith('.move') ? [targetPath] : [];
	}

	return fs.readdirSync(targetPath, { withFileTypes: true })
		.sort((left, right) => left.name.localeCompare(right.name))
		.flatMap((entry) => {
			const entryPath = path.join(targetPath, entry.name);
			if (entry.isDirectory()) {
				return collectMoveFiles(entryPath);
			}
			return entry.name.endsWith('.move') ? [entryPath] : [];
		});
}

main();
