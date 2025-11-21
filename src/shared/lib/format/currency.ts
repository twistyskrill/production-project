type CurrencyCode = "USD" | "EUR" | "RUB" | "GBP";

export function formatCurrency(
	value: number,
	{
		currency = "USD",
		locale = "en-US",
		maximumFractionDigits = 2,
	}: {
		currency?: CurrencyCode;
		locale?: string;
		maximumFractionDigits?: number;
	} = {}
) {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		maximumFractionDigits,
	}).format(value);
}

export function formatSignedPercent(value: number, digits = 2) {
	return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatSignedNumber(value: number, digits = 2) {
	return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}
