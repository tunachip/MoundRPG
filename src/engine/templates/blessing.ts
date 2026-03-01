// src/engine/templates/blessing.ts

import { GameElement, EntityCulture } from '../types.ts';
import { ListenerTemplate } from './listener.ts';

export interface BlessingTemplate {
	name:					 string;
	devNotes:			 string;
	entityCulture: EntityCulture;
	element:			 GameElement;
	listeners:		 Array<ListenerTemplate>;
}
