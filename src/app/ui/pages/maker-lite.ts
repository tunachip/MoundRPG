import './maker-lite.css';

import {
	DamageElements,
	MoveTypes,
	OpCodes,
	Speeds,
	Statuses,
} from '../../../shared/constants.ts';

interface SimpleMoveDraft {
	name: string;
	element: typeof DamageElements[number];
	type: typeof MoveTypes[number];
	speed: typeof Speeds[number];
	canChain: boolean;
	baseDamage: number;
	baseIterations: number;
	humanDescription: string;
	templateText: string;
	artDataUrl: string;
}

const mount = document.querySelector('main');
if (!mount) {
	throw new Error('Missing <main> mount node');
}

const draft: SimpleMoveDraft = {
	name: 'New Move',
	element: 'water',
	type: 'attack',
	speed: 'normal',
	canChain: true,
	baseDamage: 2,
	baseIterations: 1,
	humanDescription: 'A plain-language move idea goes here.',
	templateText: '',
	artDataUrl: '',
};

let paintMode: 'draw' | 'erase' = 'draw';

const shell = document.createElement('div');
shell.className = 'lite-shell';

const boardWrap = document.createElement('section');
boardWrap.className = 'lite-board-wrap';

const board = document.createElement('div');
board.className = 'lite-board';

const card = document.createElement('article');
card.className = 'lite-card';
board.append(card);
boardWrap.append(board);

const panel = document.createElement('aside');
panel.className = 'lite-panel';

const title = document.createElement('h1');
title.textContent = 'Simple Move Maker';

const intro = document.createElement('div');
intro.className = 'status-box';
intro.textContent = 'Fill out the fields, sketch on the card, then ask the backend generator to turn the human description into a valid move template.';

const form = document.createElement('div');
form.className = 'lite-form';

const statusBox = document.createElement('div');
statusBox.className = 'status-box';
statusBox.textContent = 'Idle.';

const templateBox = document.createElement('pre');
templateBox.className = 'template-box';
templateBox.textContent = 'No generated template yet.';

const paintTools = document.createElement('div');
paintTools.className = 'paint-tools';

const drawButton = makeButton('Draw', () => {
	paintMode = 'draw';
	setStatus('Paint mode: draw.');
});

const eraseButton = makeButton('Erase', () => {
	paintMode = 'erase';
	setStatus('Paint mode: erase.');
});

const clearButton = makeButton('Clear Canvas', () => {
	draft.artDataUrl = '';
	renderCard();
	setStatus('Cleared canvas.');
});

paintTools.append(drawButton, eraseButton, clearButton);

const actions = document.createElement('div');
actions.className = 'lite-actions';

const generateButton = makeButton('Generate Template', async () => {
	await generateTemplate();
});

const copyButton = makeButton('Copy Template', async () => {
	if (!draft.templateText) {
		setStatus('Nothing to copy yet.');
		return;
	}
	await navigator.clipboard.writeText(draft.templateText);
	setStatus('Copied template JSON to clipboard.');
});

actions.append(generateButton, copyButton);

form.append(
	buildTextField('Move Name', draft.name, (value) => {
		draft.name = value;
		renderCard();
	}),
	buildRow(
		buildSelectField('Element', DamageElements, draft.element, (value) => {
			draft.element = value as SimpleMoveDraft['element'];
			renderCard();
		}),
		buildSelectField('Type', MoveTypes, draft.type, (value) => {
			draft.type = value as SimpleMoveDraft['type'];
			renderCard();
		}),
	),
	buildRow(
		buildSelectField('Speed', Speeds, draft.speed, (value) => {
			draft.speed = value as SimpleMoveDraft['speed'];
			renderCard();
		}),
		buildCheckboxField('Can Chain', draft.canChain, (value) => {
			draft.canChain = value;
			renderCard();
		}),
	),
	buildRow(
		buildNumberField('Base Damage', draft.baseDamage, (value) => {
			draft.baseDamage = value;
			renderCard();
		}),
		buildNumberField('Base Iterations', draft.baseIterations, (value) => {
			draft.baseIterations = value;
			renderCard();
		}),
	),
	buildTextAreaField('Human Description', draft.humanDescription, (value) => {
		draft.humanDescription = value;
		renderCard();
	}),
	paintTools,
	actions,
);

panel.append(title, intro, form, statusBox, templateBox);
shell.append(boardWrap, panel);
mount.append(shell);

renderCard();

function renderCard(): void {
	card.replaceChildren();

	const header = document.createElement('div');
	header.className = 'lite-card-header';
	header.textContent = draft.name || 'Untitled Move';

	const canvasWrap = document.createElement('div');
	canvasWrap.className = 'lite-card-canvas-wrap';

	const canvas = document.createElement('canvas');
	canvas.className = 'lite-card-canvas';
	canvas.width = 316;
	canvas.height = 220;
	enableCanvas(canvas);
	drawCanvasBackground(canvas);
	canvasWrap.append(canvas);

	const description = document.createElement('div');
	description.className = 'lite-card-section';
	description.textContent = draft.humanDescription || 'No description yet.';

	const stats = document.createElement('div');
	stats.className = 'lite-card-section';
	const statsGrid = document.createElement('div');
	statsGrid.className = 'lite-stats';
	statsGrid.append(
		makeStat('Element', draft.element),
		makeStat('Type', draft.type),
		makeStat('Speed', draft.speed),
		makeStat('Chain', draft.canChain ? 'yes' : 'no'),
		makeStat('Damage', String(draft.baseDamage)),
		makeStat('Hits', String(draft.baseIterations)),
	);
	stats.append(statsGrid);

	card.append(header, canvasWrap, description, stats);
	templateBox.textContent = draft.templateText || 'No generated template yet.';
}

function enableCanvas(canvas: HTMLCanvasElement): void {
	const context = canvas.getContext('2d');
	if (!context) {
		return;
	}

	if (draft.artDataUrl) {
		const image = new Image();
		image.onload = () => {
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
		};
		image.src = draft.artDataUrl;
	}

	let drawing = false;
	let activePointerId: number | null = null;

	canvas.addEventListener('contextmenu', (event) => {
		event.preventDefault();
	});

	canvas.addEventListener('pointerdown', (event) => {
		if (event.button !== 0 && event.button !== 2) {
			return;
		}

		drawing = true;
		activePointerId = event.pointerId;
		canvas.setPointerCapture(event.pointerId);
		const point = canvasPoint(canvas, event);
		context.beginPath();
		context.moveTo(point.x, point.y);
		context.lineCap = 'round';
		const useErase = event.button === 2 || paintMode === 'erase';
		context.lineWidth = useErase ? 14 : 3;
		context.strokeStyle = useErase ? '#fafafa' : '#111111';
		event.preventDefault();
	});

	canvas.addEventListener('pointermove', (event) => {
		if (!drawing || event.pointerId !== activePointerId) {
			return;
		}
		if (event.buttons === 0) {
			stop(event);
			return;
		}
		const point = canvasPoint(canvas, event);
		context.lineTo(point.x, point.y);
		context.stroke();
		event.preventDefault();
	});

	const stop = (event?: PointerEvent) => {
		if (!drawing) {
			return;
		}
		if (event && event.pointerId !== activePointerId) {
			return;
		}
		drawing = false;
		if (activePointerId !== null && canvas.hasPointerCapture(activePointerId)) {
			canvas.releasePointerCapture(activePointerId);
		}
		activePointerId = null;
		draft.artDataUrl = canvas.toDataURL('image/png');
	};

	canvas.addEventListener('pointerup', stop);
	canvas.addEventListener('pointercancel', stop);
	canvas.addEventListener('lostpointercapture', () => {
		if (!drawing) {
			return;
		}
		drawing = false;
		activePointerId = null;
		draft.artDataUrl = canvas.toDataURL('image/png');
	});

	window.addEventListener('pointerup', stop);
	window.addEventListener('pointercancel', stop);
	window.addEventListener('blur', () => {
		stop();
	});
}

function drawCanvasBackground(canvas: HTMLCanvasElement): void {
	const context = canvas.getContext('2d');
	if (!context) {
		return;
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = '#fafafa';
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function canvasPoint(canvas: HTMLCanvasElement, event: PointerEvent): { x: number; y: number } {
	const rect = canvas.getBoundingClientRect();
	return {
		x: ((event.clientX - rect.left) / rect.width) * canvas.width,
		y: ((event.clientY - rect.top) / rect.height) * canvas.height,
	};
}

async function generateTemplate(): Promise<void> {
	setStatus('Generating move template...');

	try {
		const response = await fetch('/api/move-template', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: draft.name,
				element: draft.element,
				type: draft.type,
				speed: draft.speed,
				canChain: draft.canChain,
				baseDamage: draft.baseDamage,
				baseIterations: draft.baseIterations,
				humanDescription: draft.humanDescription,
			}),
		});

		const payload = await response.json() as { template?: unknown; error?: string; savedPath?: string };
		if (!response.ok || !payload.template) {
			throw new Error(payload.error ?? 'Template generation failed.');
		}

		draft.templateText = JSON.stringify(payload.template, null, 2);
		renderCard();
		setStatus(`Generated and saved template${payload.savedPath ? `: ${payload.savedPath}` : '.'}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		setStatus(`Generation failed: ${message}`);
	}
}

function buildTextField(labelText: string, value: string, onInput: (value: string) => void): HTMLElement {
	const label = document.createElement('label');
	label.textContent = labelText;
	const input = document.createElement('input');
	input.value = value;
	input.addEventListener('input', () => onInput(input.value));
	label.append(input);
	return label;
}

function buildTextAreaField(labelText: string, value: string, onInput: (value: string) => void): HTMLElement {
	const label = document.createElement('label');
	label.textContent = labelText;
	const area = document.createElement('textarea');
	area.value = value;
	area.addEventListener('input', () => onInput(area.value));
	label.append(area);
	return label;
}

function buildNumberField(labelText: string, value: number, onInput: (value: number) => void): HTMLElement {
	const label = document.createElement('label');
	label.textContent = labelText;
	const input = document.createElement('input');
	input.type = 'number';
	input.value = String(value);
	input.addEventListener('input', () => onInput(Number(input.value)));
	label.append(input);
	return label;
}

function buildSelectField(labelText: string, values: readonly string[], value: string, onInput: (value: string) => void): HTMLElement {
	const label = document.createElement('label');
	label.textContent = labelText;
	const select = document.createElement('select');
	for (const optionValue of values) {
		const option = document.createElement('option');
		option.value = optionValue;
		option.textContent = optionValue;
		option.selected = optionValue === value;
		select.append(option);
	}
	select.addEventListener('change', () => onInput(select.value));
	label.append(select);
	return label;
}

function buildCheckboxField(labelText: string, value: boolean, onInput: (value: boolean) => void): HTMLElement {
	const label = document.createElement('label');
	label.textContent = labelText;
	const input = document.createElement('input');
	input.type = 'checkbox';
	input.checked = value;
	input.addEventListener('change', () => onInput(input.checked));
	label.append(input);
	return label;
}

function buildRow(...children: HTMLElement[]): HTMLElement {
	const row = document.createElement('div');
	row.className = 'lite-row';
	row.append(...children);
	return row;
}

function makeButton(label: string, onClick: () => void | Promise<void>): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', () => {
		void onClick();
	});
	return button;
}

function makeStat(label: string, value: string): HTMLElement {
	const cell = document.createElement('div');
	const title = document.createElement('strong');
	title.textContent = label;
	const text = document.createElement('div');
	text.textContent = value;
	cell.append(title, text);
	return cell;
}

function setStatus(message: string): void {
	statusBox.textContent = message;
}

void OpCodes;
void Statuses;
