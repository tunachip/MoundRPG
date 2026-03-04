import { MoveTemplate } from '../../../engine/templates/move.ts';

export const rollTideMove: MoveTemplate = {
	name: 'Roll Tide',
	devNotes: 'Basic Water Attack. When Cast, Attunes Caster to Water & Deals 2 Water Damage to Chosen Target.',
	moveType: 'attack',
	moveSpeed: 'normal',
	element: 'water',
	baseDamage: 2,
	baseIterations: 1,
	canChain: true,
	canBeChainedInto: true,
	operations: {
		fromActive: [
			{
				name: 'applyAttunement',
				args: {
					target: '$caster',
					element: '$this.element'
				}
			},
			{
				name: 'loop',
				args: {
					iterations: '$this.iterations',
					operations: [
						{
							name: 'attack',
							args: {
								target: '$choice',
								element: '$this.element',
								baseDamage: '$this.baseDamage'
							}
						}
					]
				}
			}
		],
		fromBanked: [
			{
				name: 'applyAttunement',
				args: {
					target: '$caster',
					element: '$this.element'
				}
			},
			{
				name: 'activateMove',
				args: {
					target: '$this'
				}
			}
		]
	}
};
