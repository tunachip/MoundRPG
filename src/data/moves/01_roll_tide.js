// src/data/moves/01_roll_tide.js

export const RollTide = (() => {
	const move = {
		name: 'Roll Tide',
		element: 'Water',
		type: 'Attack',
		can_chain: true,
		can_be_chained: true,
	};

	move.logic = {
		fromActive: [
			{
				op: 'attuneTo',
				args: {
					target: 'caster',
					element: move.element,
				},
			},
			{
				op: 'loop',
				args: {
					times: 1,
					ops: [
						{
							op: 'attack',
							args: {
								target: 'enemy',
								element: move.element,
								damage: 2,
							},
						},
					],
				},
			},
		],
	};

	return move;
})();

