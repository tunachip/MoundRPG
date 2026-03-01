// src/engine/rules.ts


export const ElementRules = {
	'water': {
		weakTo: ['thunder', 'plant'],
		resists: ['stone'],
		immuneTo: [],
		absorbs: ['fire'],
	},
	'stone': {
		weakTo: ['force', 'water'],
		resists: ['fire'],
		immuneTo: ['thunder'],
		absorbs: [],
	},
	'fire': {
		weakTo: ['stone', 'water'],
		resists: [],
		immuneTo: [],
		absorbs: ['plant'],
	},
	'plant': {
		weakTo: ['fire', 'vital'],
		resists: [],
		immuneTo: ['force'],
		absorbs: ['water'],
	},
	'vital': {
		weakTo: ['vital', 'force'],
		resists: ['plant'],
		immuneTo: [],
		absorbs: [],
	},
	'force': {
		weakTo: ['plant'],
		resists: ['vital'],
		immuneTo: ['thunder'],
		absorbs: [],
	},
	'thunder': {
		weakTo: ['force'],
		resists: ['water'],
		immuneTo: ['stone'],
		absorbs: [],
	},
} as const;

