// src/app/ui/pages/testing.ts

import { createTextBox } from '../widgets/text-box.ts';
import { createCombatDivs } from '../widgets/combat-divs.ts';
import { createCombatHistory } from '../widgets/combat-hist.ts';
import '../widgets/text-box.css';
import '../widgets/combat-divs.css';
import '../widgets/combat-hist.css';

const mount = document.querySelector('main');
if (!mount) {
	throw new Error('Missing<main> mount node');
}

const layout = createCombatDivs();
const history = createCombatHistory();

mount.appendChild(layout.root);
layout.mounts.history.appendChild(history.root);
layout.mounts.historyToggle.addEventListener('click', () => {
	layout.mounts.history.classList.toggle('is-open');
	layout.mounts.history.classList.toggle('is-closed');
});

layout.mounts.top.entities.appendChild(
	createTextBox({
		title: 'Enemy',
		lines: [
		  'HP:   24 / 24',
		  'EN:    2 / 6',
			'ATT:  Water(2) Stone(1)',
			'STT:  Wound(1)',
		],
		variant: 'cutout',
	})
);

layout.mounts.mid.entities.appendChild(
	createTextBox({
		title: 'Player',
		lines: [
		  'HP:   24 / 24',
		  'EN:    2 / 6',
			'ATT:  Water(2) Stone(1)',
			'STT:  Wound(1)',
		],
		variant: 'cutout',
	})
);

layout.mounts.bot.prompt.appendChild(
	createTextBox({
		lines: [
		  'Choose a Turn Action',
			' ',
			' ',
			' ',
		],
	})
);

layout.mounts.bot.select.appendChild(
	createTextBox({
		lines: [
			'▶  Roll Tide',
			'   Stone Toss',
			'   Mistify',
			'   Pass',
		],
	})
)

layout.mounts.mid.extra.moves.appendChild(
	createTextBox({
		title: 'Moves',
		lines: [
			'Roll Tide',
			'Stone Toss',
			'Mistify',
			' ',
		]
	})
)

layout.mounts.mid.extra.blessings.appendChild(
	createTextBox({
		title: 'Blessings',
		lines: [
			'N/A',
			' ',
			' ',
			' ',
		]
	})
)

layout.mounts.top.extra.moves.appendChild(
	createTextBox({
		title: 'Moves',
		lines: [
			'???',
			'???',
			'???',
			'???',
		]
	})
)

layout.mounts.top.extra.blessings.appendChild(
	createTextBox({
		title: 'Blessings',
		lines: [
			'N/A',
			' ',
			' ',
			' ',
		]
	})
)

history.pushEvent('Battle Started');
history.pushEvent('Enemy activated a move');
history.pushEvent('Player chose Roll Tide');
history.pushEvent('Player dealt 2 water damage');
