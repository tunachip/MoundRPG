// src/actor/move/types.ts

export interface Fragment {
	name: string;
	definitionId: number;
}

export interface Move {
	name: string;
	definitionId: number;
	fragments: Array<Fragment>;
	maxFragments: number;
}
