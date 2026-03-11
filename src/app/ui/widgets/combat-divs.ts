// src/app/ui/widgets/combat-divs.ts

interface ExtraMounts {
	root: HTMLElement;
	moves: HTMLElement;
	blessings: HTMLElement;
}

interface StatMounts {
	root: HTMLElement;
	entities: HTMLElement;
	extra: ExtraMounts;
}

interface CommandMounts {
	root: HTMLElement;
	prompt: HTMLElement;
	select: HTMLElement;
}

interface CombatDivMounts {
	top: StatMounts;
	mid: StatMounts;
	bot: CommandMounts;
	canvas: HTMLElement;
	history: HTMLElement;
	historyToggle: HTMLButtonElement;
}

interface CombatDivs {
	root: HTMLElement;
	mounts: CombatDivMounts;
}

export function createCombatDivs (
): CombatDivs {
	const root = document.createElement('section');
	root.className = 'combat-ui';

	// Encounter Objects
	const topMount = document.createElement('section');
	topMount.className = 'combat-encounter-zone';

	// Encounter Stats Go Here
	const topStatsMount = document.createElement('section');
	topStatsMount.className = 'combat-entity-stats';
	topMount.appendChild(topStatsMount);

	// Encounter Moves & Blessings go here
	const topExtraMount = document.createElement('section');
	topExtraMount.className = 'combat-extra-zone';

	const topMovesMount = document.createElement('section');
	topMovesMount.className = 'combat-move-stats'
	topExtraMount.appendChild(topMovesMount);

	const topBlessMount = document.createElement('section');
	topBlessMount.className = 'combat-blessing-stats'
	topExtraMount.appendChild(topBlessMount);

	topMount.appendChild(topExtraMount);
	root.appendChild(topMount);

	// Canvas Area
	const canvasMount = document.createElement('section');
	canvasMount.className = 'combat-canvas';
	root.appendChild(canvasMount);

	// Player Objects
	const midMount = document.createElement('section');
	midMount.className = 'combat-player-zone';

	// Player Stats Go Here
	const midStatsMount = document.createElement('section');
	midStatsMount.className = 'combat-entity-stats';
	midMount.appendChild(midStatsMount);

	// Player Moves & Blessings go here
	const midExtraMount = document.createElement('section');
	midExtraMount.className = 'combat-extra-zone';

	const midMovesMount = document.createElement('section');
	midMovesMount.className = 'combat-move-stats'
	midExtraMount.appendChild(midMovesMount);

	const midBlessMount = document.createElement('section');
	midBlessMount.className = 'combat-blessing-stats'
	midExtraMount.appendChild(midBlessMount);

	midMount.appendChild(midExtraMount);
	root.appendChild(midMount);

	// Menus
	const botMount = document.createElement('section');
	botMount.className = 'combat-command-zone';

	const promptMount = document.createElement('section');
	promptMount.className = 'combat-command-prompt';
	botMount.appendChild(promptMount);

	const selectMount = document.createElement('section');
	selectMount.className = 'combat-command-select';
	botMount.appendChild(selectMount);

	root.appendChild(botMount);

	// History Drawer
	const historyMount = document.createElement('section');
	historyMount.className = 'combat-history-drawer is-closed';
	root.appendChild(historyMount);

	// History Toggle Tab
	const historyToggle = document.createElement('button');
	historyToggle.className = 'combat-history-tab';
	historyToggle.textContent = 'History';
	canvasMount.appendChild(historyToggle);

	return {
		root,
		mounts: {
			top: {
				root: topMount,
				entities: topStatsMount,
				extra: {
					root: topExtraMount,
					moves: topMovesMount,
					blessings: topBlessMount,
				},
			},
			mid: {
				root: midMount,
				entities: midStatsMount,
				extra: {
					root: midExtraMount,
					moves: midMovesMount,
					blessings: midBlessMount,
				},
			},
			bot: {
				root: botMount,
				prompt: promptMount,
				select: selectMount,
			},
			canvas: canvasMount,
			history: historyMount,
			historyToggle,
		},
	};
}
