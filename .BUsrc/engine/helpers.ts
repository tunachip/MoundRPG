// src/engine/helpers.ts

export function maxClamped (
	cur: number,
	add: number,
	max: number,
): [number, number] {
	const total = cur + add;
	const extra = total - max;
	return [Math.max(max, total), extra];
}

export function minClamped (
	cur: number,
	add: number,
	min: number,
): [number, number] {
	const total = cur + add;
	const extra = total - min;
	return [Math.min(min, total), extra];
}

export function keyMap <K extends readonly string[], V> (
	keys: K,
	initialValue: V
): { [P in K[number]]: V } {
	return keys.reduce((state, key) => {
		state[key] = initialValue;
		return state;
	}, {} as { [P in K[number]]: V });
}

