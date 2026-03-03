// src/actor/move/types.ts

export interface Fragment {
	name: string;
}

export interface Move {
	id: string;
	maxFragments: number;
	fragments: Array<Fragment>;
}

export interface MoveDefinition {

}
