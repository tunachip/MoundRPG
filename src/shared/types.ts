// src/shared/types.ts

import * as Constants from './constants.ts';

export type Status				= typeof Constants.Statuses[number];
export type DamageElement = typeof Constants.DamageElements[number];
export type Culture				= typeof Constants.Cultures[number];
export type EntityType		= typeof Constants.EntityTypes[number];
export type Speed					= typeof Constants.Speeds[number];
export type MoveType			= typeof Constants.MoveTypes[number];
export type ActorType			= typeof Constants.ActorTypes[number];
export type EventTrigger  = typeof Constants.EventTriggers[number];
export type ActionType		= typeof Constants.ActionTypes[number];
