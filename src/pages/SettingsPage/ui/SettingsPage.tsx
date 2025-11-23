import { memo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "shared/config/i18n/i18n";
import { Page } from "widgets/Page/Page";
import { Select } from "shared/ui/Select/Select";
import { Input } from "shared/ui/Input/Input";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Text, TextSize } from "shared/ui/Text/Text";
import { Card } from "shared/ui/Card/Card";
import { getSettings, settingsActions } from "entities/settings";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import { useTheme, Theme } from "app/providers/ThemeProvider";
import { ensureNotificationPermission } from "shared/lib/pwa/requestNotificationPermission";
import { registerServiceWorker } from "shared/lib/pwa/registerServiceWorker";
import {
	subscribeToPush,
	unsubscribeFromPush,
	getPushSubscription,
} from "shared/lib/pwa/subscribeToPush";
import { syncQueue, getQueuedOrders } from "shared/lib/pwa/offlineQueue";
import { nanoid } from "nanoid";
import cls from "./SettingsPage.module.scss";

const themeOptions = [
	{ value: "light", content: "☀️ Light" },
	{ value: "dark", content: "🌙 Dark" },
	{ value: "system", content: "💻 System" },
];

const routeOptions = [
	{ value: "/terminal", content: "📊 Terminal" },
	{ value: "/analytics", content: "📈 Analytics" },
	{ value: "/settings", content: "⚙️ Settings" },
];

const localeOptions = [
	{ value: "en", content: "🇬🇧 English" },
	{ value: "ru", content: "🇷🇺 Русский" },
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
	const { t } = useTranslation("settings");
	const settings = useSelector(getSettings);
	const dispatch = useAppDispatch();
	const { setTheme } = useTheme();
	const [symbol, setSymbol] = useState("");
	const [alertSymbol, setAlertSymbol] = useState("");
	const [alertPrice, setAlertPrice] = useState("");
	const [alertDirection, setAlertDirection] =
		useState<"above" | "below">("above");
	const [isPushSubscribed, setIsPushSubscribed] = useState(false);
	const [queuedOrdersCount, setQueuedOrdersCount] = useState(0);
	const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] =
		useState(false);

	useEffect(() => {
		// Проверяем статус push подписки
		getPushSubscription().then((sub) => {
			setIsPushSubscribed(!!sub);
		});

		// Проверяем количество ордеров в очереди
		getQueuedOrders().then((orders) => {
			setQueuedOrdersCount(orders.length);
		});

		// Проверяем регистрацию service worker
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((regs) => {
				setIsServiceWorkerRegistered(regs.length > 0);
			});
		}

		// Обновляем счетчик каждые 5 секунд
		const interval = setInterval(() => {
			getQueuedOrders().then((orders) => {
				setQueuedOrdersCount(orders.length);
			});
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const onThemeChange = (value: string) => {
		dispatch(settingsActions.setTheme(value as typeof settings.theme));
		setTheme(mapPresetToTheme(value));
	};

	const onLocaleChange = (value: string) => {
		dispatch(settingsActions.setLocale(value as "en" | "ru"));
		i18n.changeLanguage(value);
	};

	const addSymbol = () => {
		if (!symbol || !symbol.trim()) {
			return;
		}
		dispatch(
			settingsActions.upsertWatchlist({
				symbol: symbol.toUpperCase().trim(),
			})
		);
		setSymbol("");
	};

	const handleSymbolKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			addSymbol();
		}
	};

	const enableNotifications = async () => {
		const granted = await ensureNotificationPermission();
		if (granted) {
			const subscription = await subscribeToPush();
			if (subscription) {
				setIsPushSubscribed(true);
				new Notification("Quantflow alerts enabled", {
					body: "You'll receive push alerts for your watchlist.",
					icon: "/icons/quantflow-192.svg",
				});
			}
		}
	};

	const disableNotifications = async () => {
		const unsubscribed = await unsubscribeFromPush();
		if (unsubscribed) {
			setIsPushSubscribed(false);
		}
	};

	const syncQueuedOrders = async () => {
		const count = await syncQueue();
		setQueuedOrdersCount(0);
		if (count > 0) {
			new Notification("Orders synced", {
				body: `${count} order(s) have been synced successfully.`,
				icon: "/icons/quantflow-192.svg",
			});
		}
	};

	const enableOffline = async () => {
		await registerServiceWorker();
		setIsServiceWorkerRegistered(true);
	};

	const addAlert = () => {
		if (!alertSymbol || !alertPrice) {
			return;
		}
		dispatch(
			settingsActions.upsertAlert({
				id: nanoid(),
				symbol: alertSymbol.toUpperCase().trim(),
				threshold: Number(alertPrice),
				direction: alertDirection,
				type: "price",
				active: true,
			})
		);
		setAlertSymbol("");
		setAlertPrice("");
	};

	const handleAlertKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && alertSymbol && alertPrice) {
			addAlert();
		}
	};

	return (
		<Page>
			<div className={cls.SettingsPage}>
				<div className={cls.header}>
					<Text
						title={t("title", "Settings")}
						text={t("subtitle", "Customize your trading experience")}
						size={TextSize.L}
					/>
				</div>

				<div className={cls.content}>
					{/* Appearance & Localization */}
					<Card className={cls.card}>
						<div className={cls.cardHeader}>
							<Text
								title={t("appearance.title", "Appearance & Language")}
								text={t(
									"appearance.description",
									"Customize theme and language"
								)}
							/>
						</div>
						<div className={cls.cardContent}>
							<div className={cls.settingRow}>
								<label className={cls.label}>
									{t("appearance.theme", "Theme")}
								</label>
								<Select
									options={themeOptions}
									value={settings.theme}
									onChange={onThemeChange}
								/>
							</div>
							<div className={cls.settingRow}>
								<label className={cls.label}>
									{t("appearance.language", "Language")}
								</label>
								<Select
									options={localeOptions}
									value={settings.locale}
									onChange={onLocaleChange}
								/>
							</div>
							<div className={cls.settingRow}>
								<label className={cls.label}>
									{t("appearance.defaultRoute", "Default Route")}
								</label>
								<Select
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
							</div>
						</div>
					</Card>

					{/* Watchlist */}
					<Card className={cls.card}>
						<div className={cls.cardHeader}>
							<Text
								title={t("watchlist.title", "Watchlist")}
								text={t(
									"watchlist.description",
									"Manage symbols for real-time monitoring"
								)}
							/>
						</div>
						<div className={cls.cardContent}>
							{settings.watchlist.length > 0 ? (
								<div className={cls.list}>
									{settings.watchlist.map((entry) => (
										<div key={entry.symbol} className={cls.listItem}>
											<div className={cls.listItemContent}>
												<span className={cls.symbol}>{entry.symbol}</span>
												{entry.pinned && (
													<span className={cls.badge}>📌 Pinned</span>
												)}
											</div>
											<Button
												theme={ButtonTheme.CLEAR}
												onClick={() =>
													dispatch(
														settingsActions.removeFromWatchlist(entry.symbol)
													)
												}
											>
												🗑️
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className={cls.emptyState}>
									<Text
										text={t("watchlist.empty", "No symbols in watchlist")}
									/>
								</div>
							)}
							<div className={cls.addForm}>
								<Input
									placeholder={t(
										"watchlist.placeholder",
										"Enter symbol (e.g., AAPL)"
									)}
									value={symbol}
									onChange={setSymbol}
									onKeyPress={handleSymbolKeyPress}
								/>
								<Button onClick={addSymbol} disabled={!symbol.trim()}>
									{t("watchlist.add", "Add")}
								</Button>
							</div>
						</div>
					</Card>

					{/* Alerts */}
					<Card className={cls.card}>
						<div className={cls.cardHeader}>
							<Text
								title={t("alerts.title", "Price Alerts")}
								text={t(
									"alerts.description",
									"Set up price notifications for your symbols"
								)}
							/>
						</div>
						<div className={cls.cardContent}>
							{settings.alerts.length > 0 ? (
								<div className={cls.list}>
									{settings.alerts.map((alert) => (
										<div key={alert.id} className={cls.listItem}>
											<div className={cls.listItemContent}>
												<div className={cls.alertInfo}>
													<span className={cls.symbol}>{alert.symbol}</span>
													<span className={cls.alertCondition}>
														{alert.direction === "above" ? "↑" : "↓"} $
														{alert.threshold.toFixed(2)}
													</span>
												</div>
												<div className={cls.alertStatus}>
													<span
														className={`${cls.statusBadge} ${
															alert.active ? cls.active : cls.inactive
														}`}
													>
														{alert.active ? "✓ Active" : "○ Inactive"}
													</span>
												</div>
											</div>
											<div className={cls.alertActions}>
												<Button
													theme={
														alert.active
															? ButtonTheme.OUTLINE
															: ButtonTheme.BACKGROUND
													}
													onClick={() =>
														dispatch(settingsActions.toggleAlert(alert.id))
													}
												>
													{alert.active ? "Disable" : "Enable"}
												</Button>
												<Button
													theme={ButtonTheme.CLEAR}
													onClick={() =>
														dispatch(settingsActions.removeAlert(alert.id))
													}
												>
													🗑️
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className={cls.emptyState}>
									<Text text={t("alerts.empty", "No alerts configured")} />
								</div>
							)}
							<div className={cls.addForm}>
								<div className={cls.alertFormRow}>
									<Input
										placeholder={t("alerts.symbolPlaceholder", "Symbol")}
										value={alertSymbol}
										onChange={setAlertSymbol}
										onKeyPress={handleAlertKeyPress}
									/>
									<Input
										type="number"
										step="0.01"
										placeholder={t("alerts.pricePlaceholder", "Price")}
										value={alertPrice}
										onChange={setAlertPrice}
										onKeyPress={handleAlertKeyPress}
									/>
								</div>
								<div className={cls.alertFormRow}>
									<Select
										label={t("alerts.direction", "Direction")}
										options={[
											{ value: "above", content: "↑ Above" },
											{ value: "below", content: "↓ Below" },
										]}
										value={alertDirection}
										onChange={(value) =>
											setAlertDirection(value as "above" | "below")
										}
									/>
									<Button
										onClick={addAlert}
										disabled={!alertSymbol.trim() || !alertPrice}
									>
										{t("alerts.add", "Add Alert")}
									</Button>
								</div>
							</div>
						</div>
					</Card>

					{/* PWA & Notifications */}
					<Card className={cls.card}>
						<div className={cls.cardHeader}>
							<Text
								title={t("pwa.title", "PWA & Notifications")}
								text={t(
									"pwa.description",
									"Configure offline mode and push notifications"
								)}
							/>
						</div>
						<div className={cls.cardContent}>
							<div className={cls.settingRow}>
								<div className={cls.settingInfo}>
									<label className={cls.label}>
										{t("pwa.offline", "Offline Mode")}
									</label>
									<span className={cls.settingDescription}>
										{t(
											"pwa.offlineDescription",
											"Enable service worker for offline functionality"
										)}
									</span>
								</div>
								<div className={cls.settingAction}>
									{isServiceWorkerRegistered ? (
										<span className={`${cls.statusBadge} ${cls.active}`}>
											✓ Enabled
										</span>
									) : (
										<Button onClick={enableOffline}>
											{t("pwa.enableOffline", "Enable")}
										</Button>
									)}
								</div>
							</div>

							<div className={cls.settingRow}>
								<div className={cls.settingInfo}>
									<label className={cls.label}>
										{t("pwa.pushNotifications", "Push Notifications")}
									</label>
									<span className={cls.settingDescription}>
										{t(
											"pwa.pushDescription",
											"Receive browser notifications for alerts"
										)}
									</span>
								</div>
								<div className={cls.settingAction}>
									{isPushSubscribed ? (
										<>
											<span className={`${cls.statusBadge} ${cls.active}`}>
												✓ Enabled
											</span>
											<Button
												theme={ButtonTheme.OUTLINE}
												onClick={disableNotifications}
											>
												{t("pwa.disable", "Disable")}
											</Button>
										</>
									) : (
										<Button onClick={enableNotifications}>
											{t("pwa.enable", "Enable")}
										</Button>
									)}
								</div>
							</div>

							{queuedOrdersCount > 0 && (
								<div className={cls.queueStatus}>
									<div className={cls.queueInfo}>
										<Text
											text={t(
												"pwa.queuedOrders",
												"{{count}} order(s) queued for sync",
												{ count: queuedOrdersCount }
											)}
										/>
									</div>
									<Button onClick={syncQueuedOrders}>
										{t("pwa.sync", "Sync Now")}
									</Button>
								</div>
							)}
						</div>
					</Card>
				</div>
			</div>
		</Page>
	);
};

export const SettingsPage = memo(SettingsPageComponent);
