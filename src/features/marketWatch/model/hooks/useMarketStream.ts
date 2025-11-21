import { useEffect, useRef } from "react";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import { useSelector } from "react-redux";
import { marketActions } from "entities/market";
import { mockMarketSocket } from "entities/market/lib/mockMarketSocket";
import { getAlertRules } from "entities/settings";
import { shouldTriggerAlert } from "shared/lib/alerts/shouldTriggerAlert";

export const useMarketStream = () => {
	const dispatch = useAppDispatch();
	const alerts = useSelector(getAlertRules);
	const triggeredRef = useRef<Record<string, number>>({});

	const sendNotification = async (title: string, body: string) => {
		if (typeof Notification === "undefined") {
			return;
		}
		if (Notification.permission !== "granted") {
			return;
		}
		const registration = await navigator.serviceWorker?.getRegistration();
		if (registration) {
			registration.showNotification(title, { body });
		} else {
			new Notification(title, { body });
		}
	};

	useEffect(() => {
		dispatch(marketActions.seedQuotes(mockMarketSocket.getSnapshot()));
		const unsubscribe = mockMarketSocket.subscribe(
			({ quotes, latency, updatesPerSecond }) => {
				quotes.forEach((quote) => dispatch(marketActions.updateQuote(quote)));
				dispatch(
					marketActions.setStats({
						latencyMs: latency,
						updatesPerSecond,
					})
				);
				if (alerts.length) {
					alerts.forEach((alert) => {
						const match = quotes.find((quote) => quote.symbol === alert.symbol);
						if (
							match &&
							shouldTriggerAlert(
								{
									id: alert.id,
									symbol: alert.symbol,
									threshold: alert.threshold,
									direction: alert.direction,
									active: alert.active,
									createdAt: "",
								},
								{ symbol: match.symbol, last: match.last }
							)
						) {
							const lastTriggered = triggeredRef.current[alert.id] ?? 0;
							if (Date.now() - lastTriggered > 60_000) {
								triggeredRef.current[alert.id] = Date.now();
								sendNotification(
									"Quantflow alert",
									`${alert.symbol} ${alert.direction} ${alert.threshold}`
								);
							}
						}
					});
				}
				dispatch(marketActions.setConnection(true));
			}
		);

		return () => {
			unsubscribe();
			dispatch(marketActions.setConnection(false));
		};
	}, [alerts, dispatch]);
};
