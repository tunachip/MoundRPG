// src/data/moves/examples.ts

import { MoveTemplate } from '../../engine/templates/move.ts';

export const exampleMove_1: MoveTemplate = {
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
			{ name: 'applyAttunement',
				args: { 'target': '$caster', 'element': '$this.element' }
			},
			{ name: 'loop',
				args: {
					'iterations': '$this.iterations',
					'operations': [
						{ name: 'attack',
							args: {
								'target': '$choice',
								'element': '$this.element',
								'baseDamage': '$this.baseDamage',
							}
						}
					]
				}
			},
		],
		fromBanked: [
			{ name: 'applyAttunement',
				args: { target: '$caster', element: '$this.element' }
			},
			{ name: 'activateMove',
				args: { target: '$this' }
			}
		]
	}
}

export const exampleMove_2: MoveTemplate = {
	name: 'Stone Toss',
	devNotes: 'Basic Stone Attack. When Cast, Attunes Caster to Stone & Deals 2 Stone Damage to Chosen Target.',
	moveType: 'attack',
	moveSpeed: 'normal',
	element: 'stone',
	baseDamage: 2,
	baseIterations: 1,
	canChain: true,
	canBeChainedInto: true,
	operations: {
		fromActive: [
			{ name: 'applyAttunement',
				args: { 'target': '$caster', 'element': '$this.element', }
			},
			{ name: 'loop',
				args: {
					'iterations': '$this.iterations',
					'operations': [
						{ name: 'attack',
							args: {
								'target': '$choice',
								'element': '$this.element',
								'baseDamage': '$this.baseDamage',
							}
						}
					]
				}
			},
		],
		fromBanked: [
			{ name: 'applyAttunement',
				args: { target: '$caster', element: '$this.element', }
			},
			{ name: 'activateMove',
				args: { target: '$this', }
			}
		]
	}
}

export const exampleMove_3: MoveTemplate = {
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
			{ name: 'applyCooldown',
				args: { target: '$this', turns: 2 }
			}
		],
		fromBanked: [
			{ name: 'applyAttunement',
				args: { target: '$caster', element: '$this.element', }
			},
			{ name: 'activateMove',
				args: { target: '$this', }
			}
		],
		whileOnCooldown: {
			conditions: [
				{ name: 'entityAttacked',
					args: { target: '$this.owner' },
					expects: true
				}
			],
			operations: [
				{ name: 'condition',
					args: {
						if: {
							conditions: [
								{ name: 'rngBoolean',
									args: { true: 1, false: 3 }
								}
							],
							expects: true,
						},
						then: [
							{	name: 'ignoreNextDamage',
								args: { target: '$this.owner' }
							}
						],
						else: [
							{ name: 'continue',
								args: {},
							}
						]
					}
				}
			]
		}
	}
}

