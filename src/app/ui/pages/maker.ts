import './maker.css';

import {
	ActorTypes,
	Cultures,
	DamageElements,
	EntityTypes,
	EventTriggers,
	MoveTypes,
	OpCodes,
	Speeds,
	Statuses,
} from '../../../shared/constants.ts';
import { TemperamentTags } from '../../../content/encounters/types.ts';

type CardKind = 'move' | 'entity';
type MockMoveState = 'active' | 'banked' | 'cooldown';

interface BoardPlacement {
	x: number;
	y: number;
	z: number;
}

interface DraftMove {
	id: string;
	kind: 'move';
	name: string;
	element: typeof DamageElements[number];
	type: typeof MoveTypes[number];
	speed: typeof Speeds[number];
	canChain: boolean;
	baseDamage: number;
	baseIterations: number;
	humanSummary: string;
	trigger: typeof EventTriggers[number];
	mockState: MockMoveState;
	targetType: typeof ActorTypes[number];
	target: 'caster' | 'chosen' | 'random' | 'self';
	opcode: typeof OpCodes[number];
	status: typeof Statuses[number];
	rawDetails: string;
	artDataUrl: string;
	placement: BoardPlacement;
}

interface DraftEntity {
	id: string;
	kind: 'entity';
	name: string;
	entityType: typeof EntityTypes[number];
	culture: typeof Cultures[number];
	level: number;
	hp: number;
	maxHp: number;
	energy: number;
	maxEnergy: number;
	tempersText: string;
	moveNamesText: string;
	blessingsText: string;
	humanSummary: string;
	rawDetails: string;
	artDataUrl: string;
	placement: BoardPlacement;
}

type DraftCard = DraftMove | DraftEntity;

interface MakerState {
	cards: DraftCard[];
	selectedCardId: string | null;
	sourceEntityId: string | null;
	targetEntityId: string | null;
	activeMoveId: string | null;
	log: string[];
}

interface GeneratedMoveFile {
	id: number;
	fileName: string;
	exportName: string;
	name: string;
	source: string;
}

interface GeneratedEncounterFile {
	id: number;
	fileName: string;
	exportName: string;
	name: string;
	source: string;
}

interface RegistryEntry {
	id: number;
	fileName: string;
	exportName: string;
	name: string;
}

const mount = document.querySelector('main');
if (!mount) {
	throw new Error('Missing <main> mount node');
}

let zCounter = 1;

const state: MakerState = {
	cards: [
		createDefaultMoveCard(40, 60),
		createDefaultEntityCard(380, 100),
		createDefaultEntityCard(720, 320),
	],
	selectedCardId: null,
	sourceEntityId: null,
	targetEntityId: null,
	activeMoveId: null,
	log: ['Maker ready. Drag cards on the board, sketch into them, and export drafts when you want to keep a set.'],
};

state.selectedCardId = state.cards[0]?.id ?? null;
state.activeMoveId = state.cards.find((card): card is DraftMove => card.kind === 'move')?.id ?? null;
state.sourceEntityId = state.cards.find((card): card is DraftEntity => card.kind === 'entity')?.id ?? null;
state.targetEntityId = state.cards.filter((card): card is DraftEntity => card.kind === 'entity')[1]?.id ?? null;

const shell = document.createElement('div');
shell.className = 'maker-shell';

const boardShell = document.createElement('section');
boardShell.className = 'board-shell';

const boardToolbar = document.createElement('div');
boardToolbar.className = 'board-toolbar';

const boardTitleWrap = document.createElement('div');
const boardTitle = document.createElement('h1');
boardTitle.textContent = 'Mock Board';
const boardHint = document.createElement('p');
boardHint.className = 'status-line';
boardHint.textContent = 'Header drag moves cards. Select a card and edit its details in the inspector.';
boardTitleWrap.append(boardTitle, boardHint);

const boardActions = document.createElement('div');
boardActions.className = 'control-grid';

const createMoveButton = makeButton('New Move', () => {
	const card = createDefaultMoveCard(36 + state.cards.length * 18, 36 + state.cards.length * 12);
	state.cards.push(card);
	state.selectedCardId = card.id;
	state.activeMoveId = card.id;
	pushLog(`Added move card "${card.name}".`);
	render();
});

const createEntityButton = makeButton('New Entity', () => {
	const card = createDefaultEntityCard(340 + state.cards.length * 14, 80 + state.cards.length * 18);
	state.cards.push(card);
	state.selectedCardId = card.id;
	if (!state.sourceEntityId) {
		state.sourceEntityId = card.id;
	} else if (!state.targetEntityId || state.targetEntityId === state.sourceEntityId) {
		state.targetEntityId = card.id;
	}
	pushLog(`Added entity card "${card.name}".`);
	render();
});

const exportDirectoryButton = makeButton('Export To Project', async () => {
	await exportToProjectDirectory();
});

const downloadBundleButton = makeButton('Download Bundle', () => {
	downloadBundle();
});

boardActions.append(createMoveButton, createEntityButton, exportDirectoryButton, downloadBundleButton);
boardToolbar.append(boardTitleWrap, boardActions);

const board = document.createElement('div');
board.className = 'board-stage';

const panel = document.createElement('aside');
panel.className = 'maker-panel';

panel.append(
	buildPanelHeader(),
	buildSelectionSection(),
	buildMockSection(),
	buildLibrarySection(),
	buildInspectorSection(),
	buildExportSection(),
);

boardShell.append(boardToolbar, board);
shell.append(boardShell, panel);
mount.append(shell);

render();

function buildPanelHeader(): HTMLElement {
	const wrap = document.createElement('section');

	const title = document.createElement('h2');
	title.textContent = 'Move And Encounter Maker';

	const text = document.createElement('p');
	text.textContent = 'This page is a draft workshop: build cards, place them on a fake board, rough in art, tweak numbers, and export the metadata set.';

	wrap.append(title, text);
	return wrap;
}

function buildSelectionSection(): HTMLElement {
	const wrap = document.createElement('section');

	const title = document.createElement('h2');
	title.textContent = 'Mock Selection';

	const grid = document.createElement('div');
	grid.className = 'selection-grid';
	grid.dataset.role = 'selection-grid';

	wrap.append(title, grid);
	return wrap;
}

function buildMockSection(): HTMLElement {
	const wrap = document.createElement('section');

	const title = document.createElement('h2');
	title.textContent = 'Mock Actions';

	const applyButton = makeButton('Use Move', () => {
		applyMockMove();
	});

	const resetButton = makeButton('Reset Stats', () => {
		for (const card of state.cards) {
			if (card.kind === 'entity') {
				card.hp = card.maxHp;
				card.energy = card.maxEnergy;
			}
		}
		pushLog('Reset entity HP and energy to max values.');
		render();
	});

	const clearLogButton = makeButton('Clear Log', () => {
		state.log = [];
		render();
	});

	const controls = document.createElement('div');
	controls.className = 'control-grid';
	controls.append(applyButton, resetButton, clearLogButton);

	const log = document.createElement('div');
	log.className = 'mock-log';
	log.dataset.role = 'log';

	wrap.append(title, controls, log);
	return wrap;
}

function buildLibrarySection(): HTMLElement {
	const wrap = document.createElement('section');

	const title = document.createElement('h2');
	title.textContent = 'Card Library';

	const library = document.createElement('div');
	library.className = 'library';
	library.dataset.role = 'library';

	wrap.append(title, library);
	return wrap;
}

function buildInspectorSection(): HTMLElement {
	const wrap = document.createElement('section');

	const title = document.createElement('h2');
	title.textContent = 'Selected Card';

	const inspector = document.createElement('div');
	inspector.dataset.role = 'inspector';

	wrap.append(title, inspector);
	return wrap;
}

function buildExportSection(): HTMLElement {
	const wrap = document.createElement('section');

	const title = document.createElement('h2');
	title.textContent = 'Export Notes';

	const note = document.createElement('p');
	note.textContent = 'Project export expects you to pick the repo root. It writes numbered move and encounter `.ts` files into `src/content/...`, rewrites both registry files, and also saves a `maker-export.json` snapshot.';

	const status = document.createElement('p');
	status.className = 'status-line';
	status.dataset.role = 'export-status';
	status.textContent = supportsDirectoryExport()
		? 'Project export is available in this browser.'
		: 'Directory export is unavailable here, so use the download bundle fallback.';

	wrap.append(title, note, status);
	return wrap;
}

function render(): void {
	renderSelectionGrid();
	renderLibrary();
	renderLog();
	renderBoard();
	renderInspector();
}

function renderSelectionGrid(): void {
	const grid = panel.querySelector<HTMLElement>('[data-role="selection-grid"]');
	if (!grid) {
		return;
	}

	grid.replaceChildren(
		buildSelectControl('Source Entity', getEntityCards(), state.sourceEntityId, (value) => {
			state.sourceEntityId = value;
			render();
		}),
		buildSelectControl('Target Entity', getEntityCards(), state.targetEntityId, (value) => {
			state.targetEntityId = value;
			render();
		}),
		buildSelectControl('Active Move', getMoveCards(), state.activeMoveId, (value) => {
			state.activeMoveId = value;
			render();
		}),
		buildSelectionStatus(),
	);
}

function buildSelectionStatus(): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = 'status-line';
	const selectedCard = getSelectedCard();
	wrap.textContent = selectedCard
		? `Selected: ${selectedCard.name} (${selectedCard.kind})`
		: 'Selected: none';
	return wrap;
}

function renderLibrary(): void {
	const library = panel.querySelector<HTMLElement>('[data-role="library"]');
	if (!library) {
		return;
	}

	const chips = state.cards.map((card) => {
		const button = document.createElement('button');
		button.className = `card-chip${card.id === state.selectedCardId ? ' is-selected' : ''}`;
		button.textContent = `${card.kind === 'move' ? 'Move' : 'Entity'}: ${card.name}`;
		button.addEventListener('click', () => {
			state.selectedCardId = card.id;
			if (card.kind === 'move') {
				state.activeMoveId = card.id;
			}
			render();
		});
		return button;
	});

	library.replaceChildren(...chips);
}

function renderLog(): void {
	const log = panel.querySelector<HTMLElement>('[data-role="log"]');
	if (!log) {
		return;
	}

	log.textContent = state.log.length > 0 ? state.log.join('\n') : 'No mock events yet.';
}

function renderBoard(): void {
	board.replaceChildren(...state.cards.map((card) => renderCard(card)));
}

function renderInspector(): void {
	const inspector = panel.querySelector<HTMLElement>('[data-role="inspector"]');
	if (!inspector) {
		return;
	}

	const selectedCard = getSelectedCard();
	if (!selectedCard) {
		const empty = document.createElement('div');
		empty.className = 'inspector-empty';
		empty.textContent = 'Select a card on the board to edit its details.';
		inspector.replaceChildren(empty);
		return;
	}

	inspector.replaceChildren(selectedCard.kind === 'move' ? buildMoveDetails(selectedCard) : buildEntityDetails(selectedCard));
}

function renderCard(card: DraftCard): HTMLElement {
	const article = document.createElement('article');
	article.className = `board-card${card.id === state.selectedCardId ? ' is-selected' : ''}`;
	article.dataset.kind = card.kind;
	article.style.left = `${card.placement.x}px`;
	article.style.top = `${card.placement.y}px`;
	article.style.zIndex = String(card.placement.z);
	article.style.setProperty('--card-accent', getCardAccent(card));
	article.addEventListener('pointerdown', () => {
		state.selectedCardId = card.id;
		card.placement.z = nextZ();
		render();
	});

	const header = document.createElement('div');
	header.className = 'board-card-header';
	enableDragging(header, article, card);

	const typePill = document.createElement('span');
	typePill.className = 'card-type-pill';
	typePill.textContent = card.kind;

	const nameInput = document.createElement('input');
	nameInput.value = card.name;
	nameInput.placeholder = card.kind === 'move' ? 'Move Name' : 'Entity Name';
	nameInput.addEventListener('input', () => {
		card.name = nameInput.value;
		renderSelectionGrid();
		renderLibrary();
	});
	stopPointerPropagation(nameInput);

	header.append(typePill, nameInput);

	const canvasWrap = document.createElement('div');
	canvasWrap.className = 'card-canvas-wrap';

	const canvas = document.createElement('canvas');
	canvas.className = 'card-canvas';
	canvas.width = 296;
	canvas.height = 210;
	canvas.setAttribute('aria-label', `${card.name} sketch pad`);
	enableCanvasSketching(canvas, card);
	drawCanvasBackground(canvas, card);
	canvasWrap.append(canvas);

	const summarySection = document.createElement('section');
	summarySection.className = 'card-section';
	const summaryLabel = document.createElement('div');
	summaryLabel.textContent = card.kind === 'move' ? 'Basic Readout' : 'Summary';
	const summaryArea = document.createElement('textarea');
	summaryArea.value = card.humanSummary;
	summaryArea.placeholder = card.kind === 'move'
		? 'Human-facing move description'
		: 'Human-facing encounter notes';
	summaryArea.addEventListener('input', () => {
		card.humanSummary = summaryArea.value;
	});
	stopPointerPropagation(summaryArea);
	summarySection.append(summaryLabel, summaryArea);

	const statsSection = document.createElement('section');
	statsSection.className = 'card-section';
	statsSection.append(card.kind === 'move' ? buildMoveReadout(card) : buildEntityReadout(card));

	article.append(header, canvasWrap, summarySection, statsSection);
	return article;
}

function buildMoveReadout(card: DraftMove): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = 'stat-readout';
	wrap.append(
		makeReadoutCell('Element', card.element),
		makeReadoutCell('Type', card.type),
		makeReadoutCell('Speed', card.speed),
		makeReadoutCell('Chain', card.canChain ? 'yes' : 'no'),
		makeReadoutCell('Damage', String(card.baseDamage)),
		makeReadoutCell('Hits', String(card.baseIterations)),
		makeReadoutCell('Mock', card.mockState),
		makeReadoutCell('Op', card.opcode),
	);

	const mockControls = document.createElement('div');
	mockControls.className = 'mock-controls';

	mockControls.append(
		makeButton('Mark Active', () => {
			card.mockState = 'active';
			render();
		}),
		makeButton('Mark Banked', () => {
			card.mockState = 'banked';
			render();
		}),
		makeButton('Mark Cooldown', () => {
			card.mockState = 'cooldown';
			render();
		}),
		makeButton('Use As Active', () => {
			state.activeMoveId = card.id;
			render();
		}),
	);

	const section = document.createElement('div');
	section.append(wrap, mockControls);
	return section;
}

function buildEntityReadout(card: DraftEntity): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = 'stat-readout';
	wrap.append(
		makeReadoutCell('HP', `${card.hp}/${card.maxHp}`),
		makeReadoutCell('EN', `${card.energy}/${card.maxEnergy}`),
		makeReadoutCell('Culture', card.culture),
		makeReadoutCell('Type', card.entityType),
		makeReadoutCell('Level', String(card.level)),
		makeReadoutCell('Moves', String(splitLines(card.moveNamesText).length)),
		makeReadoutCell('Tempers', splitLines(card.tempersText).join(', ') || 'none'),
		makeReadoutCell('Blessings', String(splitLines(card.blessingsText).length)),
	);

	const mockControls = document.createElement('div');
	mockControls.className = 'mock-controls';

	mockControls.append(
		makeButton('HP -1', () => {
			card.hp = Math.max(0, card.hp - 1);
			render();
		}),
		makeButton('HP +1', () => {
			card.hp = Math.min(card.maxHp, card.hp + 1);
			render();
		}),
		makeButton('EN -1', () => {
			card.energy = Math.max(0, card.energy - 1);
			render();
		}),
		makeButton('EN +1', () => {
			card.energy = Math.min(card.maxEnergy, card.energy + 1);
			render();
		}),
		makeButton('Use As Source', () => {
			state.sourceEntityId = card.id;
			render();
		}),
		makeButton('Use As Target', () => {
			state.targetEntityId = card.id;
			render();
		}),
	);

	const section = document.createElement('div');
	section.append(wrap, mockControls);
	return section;
}

function buildMoveDetails(card: DraftMove): HTMLElement {
	const wrap = document.createElement('div');
	const grid = document.createElement('div');
	grid.className = 'detail-grid';

	grid.append(
		buildSelectField('Element', DamageElements, card.element, (value) => {
			card.element = value as DraftMove['element'];
			render();
		}),
		buildSelectField('Move Type', MoveTypes, card.type, (value) => {
			card.type = value as DraftMove['type'];
			render();
		}),
		buildSelectField('Speed', Speeds, card.speed, (value) => {
			card.speed = value as DraftMove['speed'];
			render();
		}),
		buildSelectField('Trigger', EventTriggers, card.trigger, (value) => {
			card.trigger = value as DraftMove['trigger'];
		}),
		buildSelectField('OpCode', OpCodes, card.opcode, (value) => {
			card.opcode = value as DraftMove['opcode'];
			render();
		}),
		buildSelectField('Target Type', ActorTypes, card.targetType, (value) => {
			card.targetType = value as DraftMove['targetType'];
		}),
		buildSelectField('Target', ['caster', 'chosen', 'random', 'self'], card.target, (value) => {
			card.target = value as DraftMove['target'];
		}),
		buildSelectField('Status', Statuses, card.status, (value) => {
			card.status = value as DraftMove['status'];
		}),
		buildNumberField('Base Damage', card.baseDamage, (value) => {
			card.baseDamage = value;
			render();
		}),
		buildNumberField('Iterations', card.baseIterations, (value) => {
			card.baseIterations = value;
			render();
		}),
		buildCheckboxField('Can Chain', card.canChain, (value) => {
			card.canChain = value;
			render();
		}),
		buildTextAreaField('Raw Notes', card.rawDetails, 'full-span', (value) => {
			card.rawDetails = value;
		}),
	);

	const codePreview = document.createElement('pre');
	codePreview.className = 'code-preview';
	codePreview.textContent = JSON.stringify(exportMoveCard(card), null, 2);

	wrap.append(grid, codePreview);
	return wrap;
}

function buildEntityDetails(card: DraftEntity): HTMLElement {
	const wrap = document.createElement('div');
	const grid = document.createElement('div');
	grid.className = 'detail-grid';

	grid.append(
		buildSelectField('Entity Type', EntityTypes, card.entityType, (value) => {
			card.entityType = value as DraftEntity['entityType'];
			render();
		}),
		buildSelectField('Culture', Cultures, card.culture, (value) => {
			card.culture = value as DraftEntity['culture'];
			render();
		}),
		buildNumberField('Level', card.level, (value) => {
			card.level = value;
			render();
		}),
		buildNumberField('HP', card.hp, (value) => {
			card.hp = value;
			render();
		}),
		buildNumberField('Max HP', card.maxHp, (value) => {
			card.maxHp = value;
			card.hp = Math.min(card.hp, card.maxHp);
			render();
		}),
		buildNumberField('Energy', card.energy, (value) => {
			card.energy = value;
			render();
		}),
		buildNumberField('Max Energy', card.maxEnergy, (value) => {
			card.maxEnergy = value;
			card.energy = Math.min(card.energy, card.maxEnergy);
			render();
		}),
		buildTextAreaField('Tempers', card.tempersText, 'full-span', (value) => {
			card.tempersText = value;
			render();
		}),
		buildTextAreaField('Move Names', card.moveNamesText, 'full-span', (value) => {
			card.moveNamesText = value;
			render();
		}),
		buildTextAreaField('Blessings', card.blessingsText, 'full-span', (value) => {
			card.blessingsText = value;
			render();
		}),
		buildTextAreaField('Raw Notes', card.rawDetails, 'full-span', (value) => {
			card.rawDetails = value;
		}),
	);

	const helper = document.createElement('p');
	helper.className = 'status-line';
	helper.textContent = `Known temperament tags: ${TemperamentTags.join(', ')}`;

	const codePreview = document.createElement('pre');
	codePreview.className = 'code-preview';
	codePreview.textContent = JSON.stringify(exportEntityCard(card), null, 2);

	wrap.append(grid, helper, codePreview);
	return wrap;
}

function buildSelectControl(
	labelText: string,
	cards: DraftCard[],
	selectedId: string | null,
	onChange: (value: string | null) => void,
): HTMLElement {
	const wrap = document.createElement('label');
	wrap.className = 'status-line';
	wrap.textContent = `${labelText} `;

	const select = document.createElement('select');
	const emptyOption = document.createElement('option');
	emptyOption.value = '';
	emptyOption.textContent = 'None';
	select.append(emptyOption);

	for (const card of cards) {
		const option = document.createElement('option');
		option.value = card.id;
		option.textContent = card.name || '(untitled)';
		option.selected = selectedId === card.id;
		select.append(option);
	}

	select.addEventListener('change', () => {
		onChange(select.value || null);
	});

	wrap.append(select);
	return wrap;
}

function buildSelectField(
	labelText: string,
	options: readonly string[],
	value: string,
	onChange: (value: string) => void,
): HTMLElement {
	const wrap = document.createElement('label');
	const text = document.createElement('div');
	text.textContent = labelText;
	const select = document.createElement('select');
	for (const optionValue of options) {
		const option = document.createElement('option');
		option.value = optionValue;
		option.textContent = optionValue;
		option.selected = optionValue === value;
		select.append(option);
	}
	select.addEventListener('change', () => onChange(select.value));
	stopPointerPropagation(select);
	wrap.append(text, select);
	return wrap;
}

function buildNumberField(
	labelText: string,
	value: number,
	onChange: (value: number) => void,
): HTMLElement {
	const wrap = document.createElement('label');
	const text = document.createElement('div');
	text.textContent = labelText;
	const input = document.createElement('input');
	input.type = 'number';
	input.value = String(value);
	input.addEventListener('input', () => {
		onChange(Number(input.value));
	});
	stopPointerPropagation(input);
	wrap.append(text, input);
	return wrap;
}

function buildCheckboxField(
	labelText: string,
	value: boolean,
	onChange: (value: boolean) => void,
): HTMLElement {
	const wrap = document.createElement('label');
	wrap.className = 'status-line';
	const input = document.createElement('input');
	input.type = 'checkbox';
	input.checked = value;
	input.addEventListener('change', () => onChange(input.checked));
	stopPointerPropagation(input);
	wrap.append(input, document.createTextNode(` ${labelText}`));
	return wrap;
}

function buildTextAreaField(
	labelText: string,
	value: string,
	extraClassName: string,
	onChange: (value: string) => void,
): HTMLElement {
	const wrap = document.createElement('label');
	if (extraClassName) {
		wrap.className = extraClassName;
	}
	const text = document.createElement('div');
	text.textContent = labelText;
	const area = document.createElement('textarea');
	area.value = value;
	area.addEventListener('input', () => onChange(area.value));
	stopPointerPropagation(area);
	wrap.append(text, area);
	return wrap;
}

function makeReadoutCell(label: string, value: string): HTMLElement {
	const cell = document.createElement('div');
	const title = document.createElement('strong');
	title.textContent = label;
	const text = document.createElement('div');
	text.textContent = value;
	cell.append(title, text);
	return cell;
}

function makeButton(label: string, onClick: () => void | Promise<void>): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', (event) => {
		event.stopPropagation();
		void onClick();
	});
	return button;
}

function createDefaultMoveCard(x: number, y: number): DraftMove {
	return {
		id: crypto.randomUUID(),
		kind: 'move',
		name: 'New Move',
		element: 'water',
		type: 'attack',
		speed: 'normal',
		canChain: true,
		baseDamage: 2,
		baseIterations: 1,
		humanSummary: 'Describe the move in plain language here.',
		trigger: 'pre:executeTurn',
		mockState: 'active',
		targetType: 'entity',
		target: 'chosen',
		opcode: 'attack',
		status: 'wound',
		rawDetails: 'Add compiler-facing notes, sequencing thoughts, or pseudo move logic.',
		artDataUrl: '',
		placement: { x, y, z: nextZ() },
	};
}

function createDefaultEntityCard(x: number, y: number): DraftEntity {
	return {
		id: crypto.randomUUID(),
		kind: 'entity',
		name: 'New Entity',
		entityType: 'encounter',
		culture: 'bastard',
		level: 1,
		hp: 20,
		maxHp: 20,
		energy: 0,
		maxEnergy: 6,
		tempersText: 'utilitarian\ndefensive',
		moveNamesText: 'Roll Tide',
		blessingsText: '',
		humanSummary: 'Summarize the combat role, intent, and rough personality.',
		rawDetails: 'Add encounter pacing notes, AI ideas, or unresolved metadata.',
		artDataUrl: '',
		placement: { x, y, z: nextZ() },
	};
}

function enableDragging(handle: HTMLElement, cardElement: HTMLElement, card: DraftCard): void {
	handle.addEventListener('pointerdown', (event) => {
		if (event.target instanceof HTMLInputElement) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		state.selectedCardId = card.id;
		card.placement.z = nextZ();

		const rect = board.getBoundingClientRect();
		const startOffsetX = event.clientX - rect.left - card.placement.x;
		const startOffsetY = event.clientY - rect.top - card.placement.y;

		const onPointerMove = (moveEvent: PointerEvent) => {
			card.placement.x = clamp(moveEvent.clientX - rect.left - startOffsetX, 0, rect.width - cardElement.offsetWidth);
			card.placement.y = clamp(moveEvent.clientY - rect.top - startOffsetY, 0, rect.height - cardElement.offsetHeight);
			cardElement.style.left = `${card.placement.x}px`;
			cardElement.style.top = `${card.placement.y}px`;
		};

		const onPointerUp = () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			render();
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
	});
}

function enableCanvasSketching(canvas: HTMLCanvasElement, card: DraftCard): void {
	const context = canvas.getContext('2d');
	if (!context) {
		return;
	}

	if (card.artDataUrl) {
		const image = new Image();
		image.onload = () => {
			context.clearRect(0, 0, canvas.width, canvas.height);
			drawCanvasBackground(canvas, card);
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
		};
		image.src = card.artDataUrl;
	}

	let drawing = false;

	canvas.addEventListener('pointerdown', (event) => {
		drawing = true;
		const { x, y } = canvasPoint(canvas, event);
		context.lineWidth = 3;
		context.lineCap = 'round';
		context.strokeStyle = '#2f241d';
		context.beginPath();
		context.moveTo(x, y);
		event.preventDefault();
		event.stopPropagation();
	});

	canvas.addEventListener('pointermove', (event) => {
		if (!drawing) {
			return;
		}
		const { x, y } = canvasPoint(canvas, event);
		context.lineTo(x, y);
		context.stroke();
		event.preventDefault();
		event.stopPropagation();
	});

	const stopDrawing = () => {
		if (!drawing) {
			return;
		}
		drawing = false;
		card.artDataUrl = canvas.toDataURL('image/png');
	};

	canvas.addEventListener('pointerup', stopDrawing);
	canvas.addEventListener('pointerleave', stopDrawing);
}

function drawCanvasBackground(canvas: HTMLCanvasElement, card: DraftCard): void {
	const context = canvas.getContext('2d');
	if (!context) {
		return;
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = 'rgba(255,255,255,0.55)';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = `${getCardAccent(card)}22`;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = 'rgba(0,0,0,0.06)';
	for (let x = 0; x < canvas.width; x += 24) {
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x, canvas.height);
		context.stroke();
	}
	for (let y = 0; y < canvas.height; y += 24) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(canvas.width, y);
		context.stroke();
	}
}

function canvasPoint(canvas: HTMLCanvasElement, event: PointerEvent): { x: number; y: number } {
	const rect = canvas.getBoundingClientRect();
	return {
		x: ((event.clientX - rect.left) / rect.width) * canvas.width,
		y: ((event.clientY - rect.top) / rect.height) * canvas.height,
	};
}

function stopPointerPropagation(element: HTMLElement): void {
	element.addEventListener('pointerdown', (event) => {
		event.stopPropagation();
	});
}

function getCardAccent(card: DraftCard): string {
	if (card.kind === 'entity') {
		return 'var(--accent)';
	}

	switch (card.element) {
		case 'water':
			return 'var(--water)';
		case 'stone':
			return 'var(--stone)';
		case 'fire':
			return 'var(--fire)';
		case 'plant':
			return 'var(--plant)';
		case 'vital':
			return 'var(--vital)';
		case 'force':
			return 'var(--force)';
		case 'thunder':
			return 'var(--thunder)';
	}
}

function getSelectedCard(): DraftCard | undefined {
	return state.cards.find((card) => card.id === state.selectedCardId);
}

function getMoveCards(): DraftMove[] {
	return state.cards.filter((card): card is DraftMove => card.kind === 'move');
}

function getEntityCards(): DraftEntity[] {
	return state.cards.filter((card): card is DraftEntity => card.kind === 'entity');
}

function applyMockMove(): void {
	const source = state.cards.find((card): card is DraftEntity => card.kind === 'entity' && card.id === state.sourceEntityId);
	const target = state.cards.find((card): card is DraftEntity => card.kind === 'entity' && card.id === state.targetEntityId);
	const move = state.cards.find((card): card is DraftMove => card.kind === 'move' && card.id === state.activeMoveId);

	if (!source || !target || !move) {
		pushLog('Mock move could not run because the source, target, or move selection is missing.');
		render();
		return;
	}

	const damage = Math.max(0, move.baseDamage * move.baseIterations);
	target.hp = Math.max(0, target.hp - damage);
	source.energy = Math.min(source.maxEnergy, source.energy + 1);
	move.mockState = move.mockState === 'active' ? 'banked' : move.mockState === 'banked' ? 'cooldown' : 'active';

	pushLog(`${source.name} used ${move.name} on ${target.name} for ${damage} ${move.element} damage. ${target.name} is now at ${target.hp}/${target.maxHp} HP.`);
	render();
}

function exportMoveCard(card: DraftMove): object {
	return {
		kind: 'move-draft',
		name: card.name,
		humanSummary: card.humanSummary,
		moveDefinition: {
			name: card.name,
			type: card.type,
			element: card.element,
			speed: card.speed,
			canChain: card.canChain,
			baseDamage: card.baseDamage,
			baseIterations: card.baseIterations,
			operations: {
				fromActive: [
					{
						operation: card.opcode,
						args: {
							target: card.target,
							targetType: card.targetType,
							element: 'meta',
							baseDamage: 'meta',
							baseIterations: 'meta',
							status: card.status,
						},
					},
				],
				whileActive: [
					{
						trigger: card.trigger,
						operations: [
							{
								operation: card.opcode,
								args: {
									target: card.target,
									targetType: card.targetType,
									status: card.status,
								},
							},
						],
					},
				],
			},
		},
		mockState: card.mockState,
		rawDetails: card.rawDetails,
		artDataUrl: card.artDataUrl,
		boardPlacement: card.placement,
	};
}

function exportEntityCard(card: DraftEntity): object {
	return {
		kind: 'entity-draft',
		name: card.name,
		humanSummary: card.humanSummary,
		entityDefinition: {
			name: card.name,
			type: card.entityType,
			culture: card.culture,
			level: card.level,
			hp: card.hp,
			maxHp: card.maxHp,
			energy: card.energy,
			maxEnergy: card.maxEnergy,
			tempers: splitLines(card.tempersText),
			moveNames: splitLines(card.moveNamesText),
			blessingNames: splitLines(card.blessingsText),
		},
		rawDetails: card.rawDetails,
		artDataUrl: card.artDataUrl,
		boardPlacement: card.placement,
	};
}

function exportBundle(): object {
	return {
		exportedAt: new Date().toISOString(),
		moves: getMoveCards().map(exportMoveCard),
		entities: getEntityCards().map(exportEntityCard),
		boardState: state.cards.map((card) => ({
			id: card.id,
			name: card.name,
			kind: card.kind,
			placement: card.placement,
		})),
	};
}

async function exportToProjectDirectory(): Promise<void> {
	if (!supportsDirectoryExport()) {
		pushLog('Directory export is not available in this browser. Use the download bundle action instead.');
		render();
		return;
	}

	try {
		const projectRootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
		const srcHandle = await projectRootHandle.getDirectoryHandle('src');
		const contentHandle = await srcHandle.getDirectoryHandle('content');
		const movesHandle = await contentHandle.getDirectoryHandle('moves');
		const encountersHandle = await contentHandle.getDirectoryHandle('encounters');

		const existingMoveEntries = await scanRegistryEntries(movesHandle);
		const existingEncounterEntries = await scanRegistryEntries(encountersHandle);
		const moveNameToId = await buildMoveNameToIdMap(movesHandle);
		const existingMoveEntriesByName = new Map(existingMoveEntries.map((entry) => [entry.name, entry]));
		const existingEncounterEntriesByName = new Map(existingEncounterEntries.map((entry) => [entry.name, entry]));

		let nextMoveId = nextAvailableId(existingMoveEntries.map((entry) => entry.id));
		const generatedMoveEntries: RegistryEntry[] = [];
		for (const card of getMoveCards()) {
			const existingEntry = existingMoveEntriesByName.get(card.name);
			const id = existingEntry?.id ?? nextMoveId;
			if (!existingEntry) {
				nextMoveId += 1;
			}
			const file = buildMoveFile(card, id);
			await writeTextFile(movesHandle, file.fileName, file.source);
			moveNameToId.set(card.name, id);
			generatedMoveEntries.push({
				id: file.id,
				fileName: file.fileName,
				exportName: file.exportName,
				name: file.name,
			});
		}

		let nextEncounterId = nextAvailableId(existingEncounterEntries.map((entry) => entry.id));
		const generatedEncounterEntries: RegistryEntry[] = [];
		for (const card of getEntityCards()) {
			const existingEntry = existingEncounterEntriesByName.get(card.name);
			const id = existingEntry?.id ?? nextEncounterId;
			if (!existingEntry) {
				nextEncounterId += 1;
			}
			const file = buildEncounterFile(card, id, moveNameToId);
			await writeTextFile(encountersHandle, file.fileName, file.source);
			generatedEncounterEntries.push({
				id: file.id,
				fileName: file.fileName,
				exportName: file.exportName,
				name: file.name,
			});
		}

		const allMoveEntries = mergeRegistryEntries(existingMoveEntries, generatedMoveEntries);
		const allEncounterEntries = mergeRegistryEntries(existingEncounterEntries, generatedEncounterEntries);

		await writeTextFile(movesHandle, 'registry.ts', buildMoveRegistrySource(allMoveEntries));
		await writeTextFile(encountersHandle, 'registry.ts', buildEncounterRegistrySource(allEncounterEntries));

		const exportRootHandle = await projectRootHandle.getDirectoryHandle('maker-export', { create: true });
		await writeJsonFile(exportRootHandle, 'maker-export.json', exportBundle());
		pushLog(`Wrote ${generatedMoveEntries.length} move files, ${generatedEncounterEntries.length} encounter files, and refreshed both registries.`);
		render();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		pushLog(`Project export failed: ${message}`);
		render();
	}
}

function downloadBundle(): void {
	const blob = new Blob([JSON.stringify(exportBundle(), null, 2)], { type: 'application/json' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'maker-export.json';
	link.click();
	URL.revokeObjectURL(link.href);
	pushLog('Downloaded maker-export.json.');
	render();
}

async function writeJsonFile(
	directoryHandle: FileSystemDirectoryHandle,
	fileName: string,
	value: object,
): Promise<void> {
	const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
	const writable = await fileHandle.createWritable();
	await writable.write(JSON.stringify(value, null, 2));
	await writable.close();
}

async function writeTextFile(
	directoryHandle: FileSystemDirectoryHandle,
	fileName: string,
	value: string,
): Promise<void> {
	const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
	const writable = await fileHandle.createWritable();
	await writable.write(value);
	await writable.close();
}

async function scanRegistryEntries(
	directoryHandle: FileSystemDirectoryHandle,
): Promise<RegistryEntry[]> {
	const entries: RegistryEntry[] = [];

	for await (const entry of directoryHandle.values()) {
		if (entry.kind !== 'file') {
			continue;
		}
		if (!entry.name.endsWith('.ts') || entry.name === 'registry.ts' || entry.name === 'index.ts' || entry.name === 'types.ts') {
			continue;
		}

		const id = parseLeadingId(entry.name);
		if (id === null) {
			continue;
		}

		const file = await entry.getFile();
		const text = await file.text();
		const exportName = parseExportName(text);
		const name = parseDefinitionName(text);
		if (!exportName || !name) {
			continue;
		}

		entries.push({
			id,
			fileName: entry.name,
			exportName,
			name,
		});
	}

	return sortRegistryEntries(entries);
}

async function buildMoveNameToIdMap(
	directoryHandle: FileSystemDirectoryHandle,
): Promise<Map<string, number>> {
	const nameToId = new Map<string, number>();

	for await (const entry of directoryHandle.values()) {
		if (entry.kind !== 'file') {
			continue;
		}
		if (!entry.name.endsWith('.ts') || entry.name === 'registry.ts' || entry.name === 'index.ts' || entry.name === 'types.ts') {
			continue;
		}

		const id = parseLeadingId(entry.name);
		if (id === null) {
			continue;
		}

		const file = await entry.getFile();
		const text = await file.text();
		const name = parseDefinitionName(text);
		if (name) {
			nameToId.set(name, id);
		}
	}

	return nameToId;
}

function buildMoveFile(card: DraftMove, id: number): GeneratedMoveFile {
	const exportName = toPascalCase(card.name);
	const fileName = `${padId(id)}_${safeFileName(card.name)}.ts`;
	const source = `// src/content/moves/${fileName}

import type { MoveDefinition } from './index.ts';

export const ${exportName}: MoveDefinition = ${formatTsObject({
	name: card.name,
	type: card.type,
	element: card.element,
	speed: card.speed,
	canChain: card.canChain,
	baseDamage: card.baseDamage,
	baseIterations: card.baseIterations,
	operations: {
		fromActive: [
			{
				operation: card.opcode,
				args: buildMoveArgs(card, true),
			},
		],
		whileActive: [
			{
				trigger: card.trigger,
				operations: [
					{
						operation: card.opcode,
						args: buildMoveArgs(card, false),
					},
				],
			},
		],
	},
})};
`;

	return { id, fileName, exportName, name: card.name, source };
}

function buildEncounterFile(
	card: DraftEntity,
	id: number,
	moveNameToId: Map<string, number>,
): GeneratedEncounterFile {
	const missingMoveNames = splitLines(card.moveNamesText).filter((name) => !moveNameToId.has(name));
	if (missingMoveNames.length > 0) {
		throw new Error(`Encounter "${card.name}" references unknown moves: ${missingMoveNames.join(', ')}`);
	}

	const exportName = `${toPascalCase(card.name)}Encounter`;
	const fileName = `${padId(id)}_${safeFileName(card.name)}.ts`;
	const source = `// src/content/encounters/${fileName}

import type { EncounterDefinition } from './index.ts';

export const ${exportName}: EncounterDefinition = ${formatTsObject({
	definitionId: id,
	name: card.name,
	level: card.level,
	culture: card.culture,
	tempers: splitLines(card.tempersText),
	hp: card.hp,
	maxHp: card.maxHp,
	energy: card.energy,
	maxEnergy: card.maxEnergy,
	moves: splitLines(card.moveNamesText).map((name) => ({
		name,
		definitionId: moveNameToId.get(name) ?? 0,
		fragments: [],
		maxFragments: 1,
	})),
	blessings: splitLines(card.blessingsText).map((name, index) => ({
		name,
		definitionId: 9000 + index,
	})),
})};
`;

	return { id, fileName, exportName, name: card.name, source };
}

function buildMoveRegistrySource(entries: RegistryEntry[]): string {
	const imports = entries
		.map((entry) => `import { ${entry.exportName} } from './${entry.fileName}';`)
		.join('\n');

	const recordEntries = entries
		.map((entry) => `\t${entry.id}: ${entry.exportName},`)
		.join('\n');

	return `// src/content/moves/registry.ts

${imports}
import type { MoveDefinition } from './types.ts';

export const MoveDefinitionsById: Record<number, MoveDefinition> = {
${recordEntries}
};

export function getMoveDefinition (definitionId: number): MoveDefinition {
\tconst definition = MoveDefinitionsById[definitionId];
\tif (!definition) {
\t\tthrow new Error(\`Unknown MoveDefinition definitionId: \${definitionId}\`);
\t}
\treturn definition;
}
`;
}

function buildEncounterRegistrySource(entries: RegistryEntry[]): string {
	const imports = entries
		.map((entry) => `import { ${entry.exportName} } from './${entry.fileName}';`)
		.join('\n');

	const recordEntries = entries
		.map((entry) => `\t${entry.id}: ${entry.exportName},`)
		.join('\n');

	return `// src/content/encounters/registry.ts

${imports}
import type { EncounterDefinition } from './types.ts';

export const EncounterDefinitionsById: Record<number, EncounterDefinition> = {
${recordEntries}
};

export function getEncounterDefinition (
\tdefinitionId: number
): EncounterDefinition {
\tconst definition = EncounterDefinitionsById[definitionId];
\tif (!definition) {
\t\tthrow new Error(\`Unknown EncounterDefinition definitionId: \${definitionId}\`);
\t}
\treturn definition;
}
`;
}

function buildMoveArgs(card: DraftMove, includeMetaValues: boolean): Record<string, unknown> {
	const args: Record<string, unknown> = {
		target: card.target,
		targetType: card.targetType,
	};

	if (card.opcode === 'attack') {
		args.element = 'meta';
	}

	if (includeMetaValues) {
		args.baseDamage = 'meta';
		args.baseIterations = 'meta';
	}

	if (card.opcode === 'applyStatus') {
		args.status = card.status;
		args.amount = 1;
	}

	return args;
}

function formatTsObject(value: unknown, indentLevel = 0): string {
	const indent = '\t'.repeat(indentLevel);
	const nextIndent = '\t'.repeat(indentLevel + 1);

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return '[]';
		}

		return `[\n${value.map((item) => `${nextIndent}${formatTsObject(item, indentLevel + 1)}`).join(',\n')}\n${indent}]`;
	}

	if (value && typeof value === 'object') {
		const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
		if (entries.length === 0) {
			return '{}';
		}

		return `{\n${entries
			.map(([key, entryValue]) => `${nextIndent}${key}: ${formatTsObject(entryValue, indentLevel + 1)}`)
			.join(',\n')}\n${indent}}`;
	}

	if (typeof value === 'string') {
		return `'${escapeTsString(value)}'`;
	}

	return String(value);
}

function escapeTsString(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseLeadingId(fileName: string): number | null {
	const match = fileName.match(/^(\d+)_/);
	return match ? Number(match[1]) : null;
}

function parseExportName(source: string): string | null {
	const match = source.match(/export const (\w+)/);
	return match ? match[1] : null;
}

function parseDefinitionName(source: string): string | null {
	const match = source.match(/name:\s*'([^']+)'/);
	return match ? match[1] : null;
}

function nextAvailableId(usedIds: number[]): number {
	return usedIds.length > 0 ? Math.max(...usedIds) + 1 : 1;
}

function sortRegistryEntries(entries: RegistryEntry[]): RegistryEntry[] {
	return [...entries].sort((a, b) => a.id - b.id);
}

function mergeRegistryEntries(
	existingEntries: RegistryEntry[],
	generatedEntries: RegistryEntry[],
): RegistryEntry[] {
	const generatedById = new Map(generatedEntries.map((entry) => [entry.id, entry]));
	const retainedExisting = existingEntries.filter((entry) => !generatedById.has(entry.id));
	return sortRegistryEntries([...retainedExisting, ...generatedEntries]);
}

function padId(id: number): string {
	return String(id).padStart(2, '0');
}

function toPascalCase(value: string): string {
	const cleaned = value
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0].toUpperCase() + part.slice(1))
		.join('');
	return cleaned || 'Untitled';
}

function safeFileName(value: string): string {
	const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
	return cleaned || 'untitled';
}

function splitLines(value: string): string[] {
	return value
		.split('\n')
		.map((item) => item.trim())
		.filter(Boolean);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function nextZ(): number {
	zCounter += 1;
	return zCounter;
}

function pushLog(message: string): void {
	state.log = [...state.log.slice(-11), message];
}

function supportsDirectoryExport(): boolean {
	return 'showDirectoryPicker' in window;
}

declare global {
	interface Window {
		showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
	}
}
