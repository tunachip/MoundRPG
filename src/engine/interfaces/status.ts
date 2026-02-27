// src/engine/interfaces/status.ts

export interface StatusState {
	burn:		boolean;
	decay:	boolean;
	wound:	boolean;
	regen:	boolean;
	curse:	boolean;
	slow:		boolean;
	quick:	boolean;
	tough:	boolean;
	strong:	boolean;
	sleep:	boolean;
	anger:	boolean;
	stun:		boolean;
}

export interface StatusTurns {
	burn:		number;
	decay:	number;
	wound:	number;
	regen:	number;
	curse:	number;
	slow:		number;
	quick:	number;
	tough:	number;
	strong:	number;
	sleep:	number;
	anger:	number;
	stun:		number;
}

