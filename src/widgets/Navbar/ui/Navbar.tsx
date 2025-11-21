import { classNames } from "shared/lib/classNames/classNames";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { AppLink } from "shared/ui/AppLink/AppLink";
import { RoutePath } from "shared/config/routeConfig/routeConfig";
import { getMarketConnection } from "entities/market";
import { getSettings } from "entities/settings";
import cls from "./Navbar.module.scss";

interface NavbarProps {
	className?: string;
}

const navLinks = [
	{ labelKey: "nav.terminal", to: RoutePath.terminal },
	{ labelKey: "nav.analytics", to: RoutePath.analytics },
	{ labelKey: "nav.settings", to: RoutePath.settings },
];

export const Navbar = ({ className }: NavbarProps) => {
	const { t } = useTranslation("common");
	const connection = useSelector(getMarketConnection);
	const settings = useSelector(getSettings);

	return (
		<header className={classNames(cls?.Navbar || "", {}, [className])}>
			<div className={cls?.brand || ""}>
				<strong>quantflow</strong>
				<span>{t("nav.tagline", "Realtime trading cockpit")}</span>
			</div>
			<nav className={cls?.navLinks || ""}>
				{navLinks.map((link) => (
					<AppLink key={link.to} to={link.to}>
						{t(link.labelKey)}
					</AppLink>
				))}
			</nav>
			<div className={cls?.metrics || ""}>
				<span>
					{t("nav.latency", "Latency")}: {connection.latencyMs.toFixed(0)}ms
				</span>
				<span>
					{t("nav.throughput", "Feed")}: {connection.updatesPerSecond}upd/s
				</span>
				<span>
					{t("nav.locale", "Locale")}: {settings.locale.toUpperCase()}
				</span>
			</div>
		</header>
	);
};
