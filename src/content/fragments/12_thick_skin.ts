// src/content/fragments/12_thick_skin.ts

import type { FragmentDefinition } from './index.ts';

export const ThickSkin: FragmentDefinition = {
	name: 'Thick Skin',
	element: 'stone',
	operationUpdates: {
		whileBanked: [
			{ when: 'start',
				operations: [{
					trigger: 'pre:executeTurn',
					operations: [
						{ operation: 'applyStatus',
							args: {
								targetType: 'entity',
								target: 'caster',
								status: 'tough',
								amount: 1,
							}
						}
					]
				}]
			}
		]
	}
}
