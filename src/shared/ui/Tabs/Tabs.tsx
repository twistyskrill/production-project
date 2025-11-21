import { classNames } from "shared/lib/classNames/classNames";
import cls from "./Tabs.module.scss";
import { useTranslation } from "react-i18next";
import { memo, ReactNode, useCallback } from "react";
import { Card, CardTheme } from "../Card/Card";

export interface TabItem {
	value: string;
	content: ReactNode;
}

interface TabsProps {
	className?: string;
	tabs: TabItem[];
	value: string;
	onTabClick: (tab: TabItem) => void;
}

export const Tabs = memo((props: TabsProps) => {
	const { className, tabs, value, onTabClick } = props;
	const { t } = useTranslation();

	const clickHandel = useCallback(
		(tab: TabItem) => {
			return () => {
				onTabClick(tab);
			};
		},
		[onTabClick]
	);
	return (
		<div className={classNames(cls?.Tabs || "", {}, [className])}>
			{tabs.map((tab) => (
				<Card
					theme={tab.value === value ? CardTheme.NORMAL : CardTheme.OUTLINED}
					className={cls?.tab || ""}
					key={tab.value}
					onClick={clickHandel(tab)}
				>
					{tab.content}
				</Card>
			))}
		</div>
	);
});
