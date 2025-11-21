import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "shared/config/i18n/i18n";
import { Page } from "widgets/Page/Page";
import { Select } from "shared/ui/Select/Select";
import { Input } from "shared/ui/Input/Input";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Text } from "shared/ui/Text/Text";
import { getSettings, settingsActions } from "entities/settings";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import { useTheme, Theme } from "app/providers/ThemeProvider";
import { ensureNotificationPermission } from "shared/lib/pwa/requestNotificationPermission";
import { registerServiceWorker } from "shared/lib/pwa/registerServiceWorker";
import { nanoid } from "nanoid";
import cls from "./SettingsPage.module.scss";

const themeOptions = [
	{ value: "light", content: "Light" },
	{ value: "dark", content: "Dark" },
	{ value: "system", content: "System" },
];

const routeOptions = [
	{ value: "/terminal", content: "Terminal" },
	{ value: "/analytics", content: "Analytics" },
	{ value: "/settings", content: "Settings" },
];

const localeOptions = [
	{ value: "en", content: "English" },
	{ value: "ru", content: "Русский" },
];

const mapPresetToTheme = (preset: string): Theme => {
	if (preset === "dark") {
		return Theme.DARK;
	}
	if (preset === "light") {
		return Theme.LIGHT;
	}
	const prefersDark =
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
	return prefersDark ? Theme.DARK : Theme.LIGHT;
};

const SettingsPageComponent = () => {
	const settings = useSelector(getSettings);
	const dispatch = useAppDispatch();
	const { i18n } = useTranslation();
	const { setTheme } = useTheme();
	const [symbol, setSymbol] = useState("");
	const [alertSymbol, setAlertSymbol] = useState("");
	const [alertPrice, setAlertPrice] = useState("");
	const [alertDirection, setAlertDirection] =
		useState<"above" | "below">("above");

	const onThemeChange = (value: string) => {
		dispatch(settingsActions.setTheme(value as typeof settings.theme));
		setTheme(mapPresetToTheme(value));
	};

	const onLocaleChange = (value: string) => {
		dispatch(settingsActions.setLocale(value as "en" | "ru"));
		i18n.changeLanguage(value);
	};

	const addSymbol = () => {
		if (!symbol) {
			return;
		}
		dispatch(
			settingsActions.upsertWatchlist({
				symbol: symbol.toUpperCase(),
			})
		);
		setSymbol("");
	};

	const enableNotifications = async () => {
		const granted = await ensureNotificationPermission();
		if (granted) {
			new Notification("Quantflow alerts enabled", {
				body: "You'll receive push alerts for your watchlist.",
			});
		}
	};

	const enableOffline = async () => {
		await registerServiceWorker();
	};

	const addAlert = () => {
		if (!alertSymbol || !alertPrice) {
			return;
		}
		dispatch(
			settingsActions.upsertAlert({
				id: nanoid(),
				symbol: alertSymbol.toUpperCase(),
				threshold: Number(alertPrice),
				direction: alertDirection,
				type: "price",
				active: true,
			})
		);
		setAlertSymbol("");
		setAlertPrice("");
	};

	return (
		<Page>
			<div className={cls?.SettingsPage || ""}>
				<section className={cls?.card || ""}>
					<Text title="Appearance" />
					<Select
						label="Theme"
						options={themeOptions}
						value={settings.theme}
						onChange={onThemeChange}
					/>
					<Select
						label="Locale"
						options={localeOptions}
						value={settings.locale}
						onChange={onLocaleChange}
					/>
				</section>
				<section className={cls?.card || ""}>
					<Text title="Routing" />
					<Select
						label="Default route"
						options={routeOptions}
						value={settings.defaultRoute}
						onChange={(value) =>
							dispatch(
								settingsActions.setDefaultRoute(
									value as typeof settings.defaultRoute
								)
							)
						}
					/>
				</section>
				<section className={cls?.card || ""}>
					<Text title="Watchlist" text="Personalize real-time board" />
					<div className={cls?.watchlist || ""}>
						{settings.watchlist.map((entry) => (
							<div key={entry.symbol} className={cls?.watchlistItem || ""}>
								<span>{entry.symbol}</span>
								<Button
									theme={ButtonTheme.CLEAR}
									onClick={() =>
										dispatch(settingsActions.removeFromWatchlist(entry.symbol))
									}
								>
									Remove
								</Button>
							</div>
						))}
					</div>
					<Input placeholder="Ticker" value={symbol} onChange={setSymbol} />
					<Button onClick={addSymbol}>Add to watchlist</Button>
				</section>
				<section className={cls?.card || ""}>
					<Text title="Alerts" text="Configure push triggers" />
					<div className={cls?.watchlist || ""}>
						{settings.alerts.map((alert) => (
							<div key={alert.id} className={cls?.watchlistItem || ""}>
								<span>
									{alert.symbol} {alert.direction} {alert.threshold}
								</span>
								<div>
									<Button
										theme={
											alert.active
												? ButtonTheme.BACKGROUND
												: ButtonTheme.OUTLINE
										}
										onClick={() =>
											dispatch(settingsActions.toggleAlert(alert.id))
										}
									>
										{alert.active ? "On" : "Off"}
									</Button>
									<Button
										theme={ButtonTheme.CLEAR}
										onClick={() =>
											dispatch(settingsActions.removeAlert(alert.id))
										}
									>
										Remove
									</Button>
								</div>
							</div>
						))}
					</div>
					<Input
						placeholder="Symbol"
						value={alertSymbol}
						onChange={setAlertSymbol}
					/>
					<div className={cls?.watchlist || ""}>
						<Input
							placeholder="Price"
							value={alertPrice}
							onChange={setAlertPrice}
						/>
						<Select
							label="Direction"
							options={[
								{ value: "above", content: "Above" },
								{ value: "below", content: "Below" },
							]}
							value={alertDirection}
							onChange={(value) =>
								setAlertDirection(value as "above" | "below")
							}
						/>
					</div>
					<Button onClick={addAlert}>Add alert</Button>
				</section>
				<section className={cls?.card || ""}>
					<Text title="PWA & Alerts" />
					<Button onClick={enableOffline}>Enable offline cache</Button>
					<Button onClick={enableNotifications}>Allow push alerts</Button>
				</section>
			</div>
		</Page>
	);
};

export const SettingsPage = memo(SettingsPageComponent);
