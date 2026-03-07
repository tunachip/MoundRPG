// src/app/ui/widgets/text-box.ts

interface TextBoxProperties {
	title?: string;
	lines: Array<string>;
	variant?: 'plain' | 'cutout';
	state?: 'default' | 'disabled' | 'selected';
	tone?: 'normal' | 'accent' | 'danger';
}

export function createTextBox (
	props: TextBoxProperties,
): HTMLElement {
	const root = document.createElement('section');
	root.className = 'textbox';

	if (props.title) {
		const titleWrap = document.createElement('section');
		titleWrap.className = 'textbox-title';

		const titleText = document.createElement('p');
		titleText.className = 'textbox-title-text';
		titleText.textContent = props.title;

		titleWrap.appendChild(titleText);
		root.appendChild(titleWrap);
	}

	const contentWrap = document.createElement('section');
	contentWrap.className = 'textbox-contents';

	for (const line of props.lines) {
		const lineEl = document.createElement('p');
		lineEl.textContent = line;
		contentWrap.appendChild(lineEl);
	}

	root.appendChild(contentWrap);

	return root;
}

const mount = document.querySelector('main');
if (mount) {
	mount.appendChild(
		createTextBox({
			title: 'Player',
			lines: ['HP: 24/24', 'Energy: 2/6'],
			variant: 'cutout',
		})
	);
}
