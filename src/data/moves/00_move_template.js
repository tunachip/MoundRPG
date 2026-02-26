// src/data/moves/01_roll_tide.js

export const MoveTemplate = (() => {
	const move = {
		name: 'Move Template',
		element: 'Neutral',
		type: 'Attack',
		can_chain: true,
		can_be_chained: true,
	};

	move.logic = {
		onCast: {
			fromActive: [
				// sequence of effects which occur when move is cast/chained from active pool
			],
			fromBanked: [
				// sequence of effects which occur when move is cast/chained from banked pool
			],
		},
		staticEffects: {
			always: [
				// sideeffects which occur according to some condition, always active
			],
			whileActive: [
				// sideeffects which occur according to some condition, only active while in active pool
			],
			whileBanked: [
				// sideeffects which occur according to some condition, only active while in banked pool
			],
			whileOnCooldown: [
				// sideeffects which occur according to some condition, only active while on cooldown
			],
		},
	};
	return move;
})();

