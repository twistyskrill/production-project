import { RouteProps } from "react-router-dom";
import { TerminalPage } from "pages/TerminalPage";
import { AnalyticsPage } from "pages/AnalyticsPage";
import { SettingsPage } from "pages/SettingsPage";
import { NotFoundPage } from "pages/NotFoundPage";
import { Navigate } from "react-router-dom";

export type AppRoutesProps = RouteProps & {
	authOnly?: boolean;
};

export enum AppRoutes {
	ROOT = "root",
	TERMINAL = "terminal",
	ANALYTICS = "analytics",
	SETTINGS = "settings",
	NOT_FOUND = "not_found",
}

export const RoutePath: Record<AppRoutes, string> = {
	[AppRoutes.ROOT]: "/",
	[AppRoutes.TERMINAL]: "/terminal",
	[AppRoutes.ANALYTICS]: "/analytics",
	[AppRoutes.SETTINGS]: "/settings",
	[AppRoutes.NOT_FOUND]: "*",
};

export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
	[AppRoutes.ROOT]: {
		path: RoutePath.root,
		element: <Navigate to={RoutePath.terminal} replace />,
	},
	[AppRoutes.TERMINAL]: {
		path: RoutePath.terminal,
		element: <TerminalPage />,
		authOnly: false,
	},
	[AppRoutes.ANALYTICS]: {
		path: RoutePath.analytics,
		element: <AnalyticsPage />,
	},
	[AppRoutes.SETTINGS]: {
		path: RoutePath.settings,
		element: <SettingsPage />,
	},
	[AppRoutes.NOT_FOUND]: {
		path: RoutePath.not_found,
		element: <NotFoundPage />,
	},
};
