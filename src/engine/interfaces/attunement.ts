// src/engine/interfaces/attunement.ts

export interface AttunementState {
	water:	 boolean;
	stone:	 boolean;
	fire:		 boolean;
	plant:	 boolean;
	vital:	 boolean;
	force:	 boolean;
	thunder: boolean;
}

export interface AttunementTurns {
	water:	 number;
	stone:	 number;
	fire:		 number;
	plant:	 number;
	vital:	 number;
	force:	 number;
	thunder: number;
}

