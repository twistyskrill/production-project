export type AlertDirection = "above" | "below";

export interface PriceAlertRule {
	id: string;
	symbol: string;
	threshold: number;
	direction: AlertDirection;
	active: boolean;
	createdAt: string;
}

export interface QuotePayload {
	symbol: string;
	last: number;
}

export function shouldTriggerAlert(rule: PriceAlertRule, quote: QuotePayload) {
	if (!rule.active || rule.symbol !== quote.symbol) {
		return false;
	}
	return rule.direction === "above"
		? quote.last >= rule.threshold
		: quote.last <= rule.threshold;
}
