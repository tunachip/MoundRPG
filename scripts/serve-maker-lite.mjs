import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 4173);
const DIST_ROOT = join(process.cwd(), 'dist', 'ui');
const OUTPUT_ROOT = join(process.cwd(), 'maker-export-lite');
const SCHEMA_PATH = join(process.cwd(), 'scripts', 'move-template.schema.json');

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.avif': 'image/avif',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
};

createServer(async (req, res) => {
	if (!req.url) {
		res.writeHead(400).end('Missing URL');
		return;
	}

	if (req.method === 'POST' && req.url === '/api/move-template') {
		await handleMoveTemplate(req, res);
		return;
	}

	if (req.method !== 'GET' && req.method !== 'HEAD') {
		res.writeHead(405).end('Method not allowed');
		return;
	}

	const rawPath = req.url === '/' ? '/maker-lite.html' : req.url;
	const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, '');
	const filePath = join(DIST_ROOT, safePath);
	const finalPath = existsSync(filePath) ? filePath : join(DIST_ROOT, 'maker-lite.html');

	res.writeHead(200, {
		'Content-Type': MIME_TYPES[extname(finalPath)] ?? 'application/octet-stream',
	});

	if (req.method === 'HEAD') {
		res.end();
		return;
	}

	createReadStream(finalPath).pipe(res);
}).listen(PORT, () => {
	console.log(`Simple maker server running at http://localhost:${PORT}/maker-lite.html`);
});

async function handleMoveTemplate(req, res) {
	try {
		const body = await readJsonBody(req);
		await mkdir(OUTPUT_ROOT, { recursive: true });

		const runId = randomUUID();
		const responsePath = join(OUTPUT_ROOT, `${runId}.response.json`);
		const savedTemplatePath = join(OUTPUT_ROOT, `${safeFileName(body.name)}.move-template.json`);
		await runCodex(buildPrompt(body), responsePath);

		const generatedText = await readFile(responsePath, 'utf8');
		const template = JSON.parse(generatedText);
		await writeFile(savedTemplatePath, JSON.stringify(template, null, 2), 'utf8');

		writeJson(res, 200, {
			template,
			savedPath: savedTemplatePath,
		});
	} catch (error) {
		writeJson(res, 500, {
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

async function readJsonBody(req) {
	let raw = '';
	for await (const chunk of req) {
		raw += chunk;
	}
	return JSON.parse(raw);
}

function writeJson(res, status, value) {
	res.writeHead(status, {
		'Content-Type': 'application/json; charset=utf-8',
	});
	res.end(JSON.stringify(value));
}

function buildPrompt(body) {
	return [
		'You are generating a valid move template for this local game project.',
		'Return only JSON that matches the provided output schema.',
		'The result should be conservative and valid against the project move structure.',
		'Prefer one or two simple operations and avoid inventing unsupported fields.',
		'Use the current draft values unless the human description strongly requires a minor adjustment.',
		`Name: ${body.name}`,
		`Element: ${body.element}`,
		`Type: ${body.type}`,
		`Speed: ${body.speed}`,
		`Can chain: ${body.canChain}`,
		`Base damage: ${body.baseDamage}`,
		`Base iterations: ${body.baseIterations}`,
		`Human description: ${body.humanDescription}`,
		'Allowed targetType values: entity, move, blessing, listener.',
		'Allowed target values: caster, chosen, random, self.',
		'For attacks, use element "meta" and baseDamage/baseIterations as "meta" when appropriate.',
		'If status is used, pick one valid status and use a small integer amount.',
	].join('\n');
}

function safeFileName(value) {
	const cleaned = String(value)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
	return cleaned || 'untitled_move';
}

function runCodex(promptText, responsePath) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			'codex',
			[
				'exec',
				'-C',
				process.cwd(),
				'--skip-git-repo-check',
				'--output-schema',
				SCHEMA_PATH,
				'-o',
				responsePath,
				'-',
			],
			{
				cwd: process.cwd(),
				stdio: ['pipe', 'pipe', 'pipe'],
			},
		);

		let stderr = '';
		let stdout = '';

		child.stdout.on('data', (chunk) => {
			stdout += String(chunk);
		});

		child.stderr.on('data', (chunk) => {
			stderr += String(chunk);
		});

		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(stderr || stdout || `codex exec exited with code ${code}`));
		});

		child.stdin.write(promptText);
		child.stdin.end();
	});
}
