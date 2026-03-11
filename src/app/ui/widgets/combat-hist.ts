// src/app/ui/widgets/combat-hist.ts

interface CombatHistoryWidget {
	root: HTMLElement;
	pushEvent: (line: string) => void;
}

export function createCombatHistory (
): CombatHistoryWidget {
	const mount = document.createElement('section');
	mount.className = 'combat-history';

	const title = document.createElement('h3');
	title.className = 'combat-history-title';
	title.textContent = 'Combat History';
	mount.appendChild(title);

	const list = document.createElement('section');
	list.className = 'combat-history-list';
	mount.appendChild(list);

	return {
		root: mount,
		pushEvent: (line: string) => {
			const entry = document.createElement('p');
			entry.className = 'combat-history-entry';
			entry.textContent = line;
			list.appendChild(entry);
		},
	};
}
