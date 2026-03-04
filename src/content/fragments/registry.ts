// src/content/fragments/registry.ts

import { WaterFragment } from './01_water_fragment.ts';
import { StoneFragment } from './02_stone_fragment.ts';
import { FireFragment } from './03_fire_fragment.ts';
import { PlantFragment } from './04_plant_fragment.ts';
import { VitalFragment } from './05_vital_fragment.ts';
import { ForceFragment } from './06_force_fragment.ts';
import { ThunderFragment } from './07_thunder_fragment.ts';
import { ThickSkin } from './12_thick_skin.ts';
import type { FragmentDefinition } from './types.ts';

export const FragmentDefinitionsById: Record<number, FragmentDefinition> = {
	1: WaterFragment,
	2: StoneFragment,
	3: FireFragment,
	4: PlantFragment,
	5: VitalFragment,
	6: ForceFragment,
	7: ThunderFragment,
	12: ThickSkin,
};

export function getFragmentDefinition (definitionId: number): FragmentDefinition {
	const definition = FragmentDefinitionsById[definitionId];
	if (!definition) {
		throw new Error(`Unknown FragmentDefinition definitionId: ${definitionId}`);
	}
	return definition;
}
