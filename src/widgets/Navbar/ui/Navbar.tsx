import { classNames } from "shared/lib/classNames/classNames";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppLink } from "shared/ui/AppLink/AppLink";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Avatar } from "shared/ui/Avatar/Avatar";
import { RoutePath } from "shared/config/routeConfig/routeConfig";
import { getMarketConnection } from "entities/market";
import { getSettings } from "entities/settings";
import { getUserAuthData } from "entities/User";
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
	const navigate = useNavigate();
	const connection = useSelector(getMarketConnection);
	const settings = useSelector(getSettings);
	const authData = useSelector(getUserAuthData);

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
			<div className={cls?.rightSection || ""}>
				<div className={cls?.metrics || ""}>
					<span className={cls?.metricItem || ""}>
						<span className={cls?.metricLabel || ""}>
							{t("nav.latency", "Latency")}:
						</span>
						<span className={cls?.metricValue || ""}>
							{connection.latencyMs.toFixed(0)}ms
						</span>
					</span>
					<span className={cls?.metricItem || ""}>
						<span className={cls?.metricLabel || ""}>
							{t("nav.throughput", "Feed")}:
						</span>
						<span className={cls?.metricValue || ""}>
							{connection.updatesPerSecond}upd/s
						</span>
					</span>
				</div>
				{authData ? (
					<Button
						theme={ButtonTheme.CLEAR}
						onClick={() => navigate(RoutePath.profile)}
						className={cls?.profileButton || ""}
					>
						<Avatar src={authData.avatar} size={32} alt={authData.username} />
						<span>{authData.username}</span>
					</Button>
				) : (
					<Button
						theme={ButtonTheme.OUTLINE}
						onClick={() => navigate(RoutePath.login)}
					>
						{t("nav.login", "Login")}
					</Button>
				)}
			</div>
		</header>
	);
};
