import { MoveTemplate } from '../../../engine/templates/move.ts';

export const mistifyMove: MoveTemplate = {
	name: 'Mistify',
	devNotes: 'Evasive Water Utility. When Cast, Goes on Cooldown. When on Cooldown, provides owner a 25% change of Dodging Damage.',
	moveType: 'utility',
	moveSpeed: 'normal',
	element: 'water',
	baseDamage: 0,
	baseIterations: 1,
	canChain: true,
	canBeChainedInto: true,
	operations: {
		fromActive: [
			{
				name: 'applyCooldown',
				args: {
					target: '$this',
					turns: 2
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
		],
		whileOnCooldown: {
			conditions: [
				{
					name: 'entityAttacked',
					args: {
						target: '$this.owner'
					},
					expects: true
				}
			],
			operations: [
				{
					name: 'condition',
					args: {
						if: {
							conditions: [
								{
									name: 'rngBoolean',
									args: {
										true: 1,
										false: 3
									}
								}
							],
							expects: true
						},
						then: [
							{
								name: 'ignoreNextDamage',
								args: {
									target: '$this.owner'
								}
							}
						],
						else: [
							{
								name: 'continue',
								args: {}
							}
						]
					}
				}
			]
		}
	}
};
