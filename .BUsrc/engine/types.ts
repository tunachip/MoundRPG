// src/engine/types.ts

import * as Constants from './constants.ts';

export type GameElement =
	typeof Constants.GameElements[number];
export type Status =
	typeof Constants.Statuses[number];
export type EntityType =
	typeof Constants.EntityTypes[number];
export type EntityCulture =
	typeof Constants.EntityCultures[number];
export type MoveType =
	typeof Constants.MoveTypes[number];
export type MoveSpeed =
	typeof Constants.MoveSpeeds[number];
export type ItemType =
	typeof Constants.ItemTypes[number];
export type EventTrigger =
	typeof Constants.EventTriggers[number];
export type TargetType =
	typeof Constants.TargetTypes[number];
export type ListenerSourceType =
	typeof Constants.ListenerSourceTypes[number];

export type Amount = number | 'indefinite' | 'all';

// TODO: Build Proper CTX Object Traits
export type Ctx = Object;

export type OperationFunction <A, R = void> = (args: A, ctx: Ctx) => R | Promise<R>;
