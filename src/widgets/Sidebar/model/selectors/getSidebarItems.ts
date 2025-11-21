import { createSelector } from "@reduxjs/toolkit";
import { SidebarItemType } from "../types/sidebar";
import { RoutePath } from "shared/config/routeConfig/routeConfig";
import MainIcon from "shared/assets/icons/main-20-20.svg";
import ArticleItem from "shared/assets/icons/article-20-20.svg";
import AboutIcon from "shared/assets/icons/about-20-20.svg";
import { StateSchema } from "app/providers/StoreProvider";

const staticSidebarItems: SidebarItemType[] = [
	{
		path: RoutePath.terminal,
		Icon: MainIcon,
		text: "Terminal",
	},
	{
		path: RoutePath.analytics,
		Icon: ArticleItem,
		text: "Analytics",
	},
	{
		path: RoutePath.settings,
		Icon: AboutIcon,
		text: "Settings",
	},
];

export const getSidebarItems = createSelector(
	[(state: StateSchema) => state.settings.locale],
	() => staticSidebarItems
);
