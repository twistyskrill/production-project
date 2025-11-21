export const randomBetween = (min: number, max: number, precision = 2) => {
	const factor = 10 ** precision;
	return Math.round((Math.random() * (max - min) + min) * factor) / factor;
};

export const pickRandom = <T>(items: T[]): T =>
	items[Math.floor(Math.random() * items.length)];

export const randomBoolean = (chance = 0.5) => Math.random() < chance;
