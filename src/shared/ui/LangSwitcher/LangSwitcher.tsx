import { classNames } from "shared/lib/classNames/classNames";
import { useTranslation } from "react-i18next";
import i18n from "shared/config/i18n/i18n";
import React from "react";
import { Button, ButtonTheme } from "../Button/Button";

interface LangSwitcherProps {
	className?: string;
	short?: boolean;
}

export const LangSwitcher = ({ className, short }: LangSwitcherProps) => {
	const { t } = useTranslation();

	const toggle = async () => {
		i18n.changeLanguage(i18n.language === "ru" ? "en" : "ru");
	};

	return (
		<Button
			className={classNames("", {}, [className])}
			theme={ButtonTheme.CLEAR}
			onClick={toggle}
		>
			{t(short ? "Короткий язык" : "Язык")}
		</Button>
	);
};
