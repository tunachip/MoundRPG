// src/shared/utils.ts

export function randomNumber (
	max: number,
	min: number = 0,
): number {
	const minCeiled: number = Math.ceil(min);
  const maxFloored: number = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

