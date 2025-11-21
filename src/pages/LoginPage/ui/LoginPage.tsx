import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page } from "widgets/Page/Page";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Input } from "shared/ui/Input/Input";
import { Text, TextSize } from "shared/ui/Text/Text";
import { userActions } from "entities/User";
import { RoutePath } from "shared/config/routeConfig/routeConfig";
import { USER_LOCALSTORAGE_KEY } from "shared/const/localstorage";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import cls from "./LoginPage.module.scss";

const LoginPageComponent = () => {
	const { t } = useTranslation("common");
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		if (!username || !password) {
			setError(t("auth.fillAll", "Please fill all fields"));
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// Моковая авторизация
			const mockUsers = [
				{ id: "1", username: "admin", password: "123", avatar: "" },
				{ id: "2", username: "user", password: "123", avatar: "" },
			];

			const user = mockUsers.find(
				(u) => u.username === username && u.password === password
			);

			if (user) {
				const userData = {
					id: user.id,
					username: user.username,
					avatar: user.avatar,
				};
				localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(userData));
				dispatch(userActions.setAuthData(userData));
				navigate(RoutePath.terminal);
			} else {
				setError(t("auth.invalidCredentials", "Invalid username or password"));
			}
		} catch (err) {
			setError(t("auth.error", "Login failed. Please try again."));
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleLogin();
		}
	};

	return (
		<Page className={cls.LoginPage}>
			<div className={cls.loginContainer}>
				<div className={cls.loginCard}>
					<div className={cls.logo}>
						<Text title="quantflow" size={TextSize.L} />
						<Text text={t("auth.tagline", "Trading Platform")} />
					</div>
					<div className={cls.form}>
						<Text
							title={t("auth.login", "Sign In")}
							text={t(
								"auth.loginSubtitle",
								"Enter your credentials to continue"
							)}
						/>
						<Input
							placeholder={t("auth.username", "Username")}
							value={username}
							onChange={setUsername}
							onKeyPress={handleKeyPress}
							autoFocus
						/>
						<Input
							type="password"
							placeholder={t("auth.password", "Password")}
							value={password}
							onChange={setPassword}
							onKeyPress={handleKeyPress}
						/>
						{error && <div className={cls.error}>{error}</div>}
						<Button
							onClick={handleLogin}
							disabled={isLoading}
							className={cls.loginButton}
						>
							{isLoading
								? t("auth.loading", "Loading...")
								: t("auth.login", "Sign In")}
						</Button>
						<div className={cls.hint}>
							<Text
								text={t(
									"auth.demoHint",
									"Demo credentials: admin/123 or user/123"
								)}
							/>
						</div>
					</div>
				</div>
			</div>
		</Page>
	);
};

export const LoginPage = memo(LoginPageComponent);
