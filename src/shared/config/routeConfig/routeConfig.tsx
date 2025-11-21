import { RouteProps } from "react-router-dom";
import { TerminalPage } from "pages/TerminalPage";
import { AnalyticsPage } from "pages/AnalyticsPage";
import { SettingsPage } from "pages/SettingsPage";
import { NotFoundPage } from "pages/NotFoundPage";
import { LoginPage } from "pages/LoginPage";
import { ProfilePage } from "pages/ProfilePage";
import { Navigate } from "react-router-dom";

export type AppRoutesProps = RouteProps & {
	authOnly?: boolean;
};

export enum AppRoutes {
	ROOT = "root",
	LOGIN = "login",
	TERMINAL = "terminal",
	ANALYTICS = "analytics",
	SETTINGS = "settings",
	PROFILE = "profile",
	NOT_FOUND = "not_found",
}

export const RoutePath: Record<AppRoutes, string> = {
	[AppRoutes.ROOT]: "/",
	[AppRoutes.LOGIN]: "/login",
	[AppRoutes.TERMINAL]: "/terminal",
	[AppRoutes.ANALYTICS]: "/analytics",
	[AppRoutes.SETTINGS]: "/settings",
	[AppRoutes.PROFILE]: "/profile",
	[AppRoutes.NOT_FOUND]: "*",
};

export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
	[AppRoutes.ROOT]: {
		path: RoutePath.root,
		element: <Navigate to={RoutePath.terminal} replace />,
	},
	[AppRoutes.LOGIN]: {
		path: RoutePath.login,
		element: <LoginPage />,
		authOnly: false,
	},
	[AppRoutes.TERMINAL]: {
		path: RoutePath.terminal,
		element: <TerminalPage />,
		authOnly: false,
	},
	[AppRoutes.ANALYTICS]: {
		path: RoutePath.analytics,
		element: <AnalyticsPage />,
		authOnly: false,
	},
	[AppRoutes.SETTINGS]: {
		path: RoutePath.settings,
		element: <SettingsPage />,
		authOnly: false,
	},
	[AppRoutes.PROFILE]: {
		path: RoutePath.profile,
		element: <ProfilePage />,
		authOnly: false,
	},
	[AppRoutes.NOT_FOUND]: {
		path: RoutePath.not_found,
		element: <NotFoundPage />,
	},
};
