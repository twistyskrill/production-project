import { classNames } from "shared/lib/classNames/classNames";
import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { LoginModal } from "features/AuthByUsername";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthData, userActions } from "entities/User";
import cls from "./Navbar.module.scss";
import { Text, TextTheme } from "shared/ui/Text/Text";
import { AppLink, AppLinkTheme } from "shared/ui/AppLink/AppLink";
import { RoutePath } from "shared/config/routeConfig/routeConfig";

interface NavbarProps {
	className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
	const { t } = useTranslation();
	const [isAuthModal, setIsAuthModal] = useState(false);
	const authData = useSelector(getUserAuthData);
	const dispatch = useDispatch();

	const onCloseModal = useCallback(() => {
		setIsAuthModal(false);
	}, []);

	const onShowModal = useCallback(() => {
		setIsAuthModal(true);
	}, []);

	const onLogout = useCallback(() => {
		dispatch(userActions.logout());
	}, [dispatch]);

	if (authData) {
		return (
			<header className={classNames(cls.Navbar, {}, [className])}>
				<Text
					theme={TextTheme.INVERTED}
					className={cls.appName}
					title={"TwistySkrill App"}
				/>
				<AppLink
					className={cls.createBtn}
					theme={AppLinkTheme.SECONDARY}
					to={RoutePath.article_create}
				>
					{t("Создать статью")}
				</AppLink>
				<Button
					theme={ButtonTheme.CLEAR_INVERTED}
					className={cls.links}
					onClick={onLogout}
				>
					{t("Выйти")}
				</Button>
			</header>
		);
	}

	return (
		<header className={classNames(cls.Navbar, {}, [className])}>
			<Button
				theme={ButtonTheme.CLEAR_INVERTED}
				className={cls.links}
				onClick={onShowModal}
			>
				{t("Войти")}
			</Button>
			{isAuthModal && (
				<LoginModal isOpen={isAuthModal} onClose={onCloseModal} />
			)}
		</header>
	);
};
