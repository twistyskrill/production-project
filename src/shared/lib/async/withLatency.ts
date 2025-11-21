export async function withLatency<T>(
	executor: () => T | Promise<T>,
	min = 60,
	max = 220
): Promise<T> {
	const jitter = Math.floor(Math.random() * (max - min + 1)) + min;
	await new Promise((resolve) => setTimeout(resolve, jitter));
	return executor();
}
