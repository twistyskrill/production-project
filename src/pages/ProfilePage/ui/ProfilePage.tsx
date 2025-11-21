import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page } from "widgets/Page/Page";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Input } from "shared/ui/Input/Input";
import { Text } from "shared/ui/Text/Text";
import { Avatar } from "shared/ui/Avatar/Avatar";
import { Card } from "shared/ui/Card/Card";
import { getUserAuthData, userActions } from "entities/User";
import { RoutePath } from "shared/config/routeConfig/routeConfig";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import cls from "./ProfilePage.module.scss";

const ProfilePageComponent = () => {
	const { t } = useTranslation("common");
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const authData = useSelector(getUserAuthData);
	const [email, setEmail] = useState("trader@quantflow.com");
	const [phone, setPhone] = useState("+1 (555) 123-4567");
	const [bio, setBio] = useState(
		"Professional trader with 5+ years of experience"
	);

	const handleLogout = () => {
		dispatch(userActions.logout());
		navigate(RoutePath.login);
	};

	if (!authData) {
		return (
			<Page>
				<Text title={t("profile.notAuthorized", "Not authorized")} />
			</Page>
		);
	}

	return (
		<Page className={cls.ProfilePage}>
			<div className={cls.profileContainer}>
				<Card className={cls.profileCard}>
					<div className={cls.header}>
						<Avatar src={authData.avatar} size={120} alt={authData.username} />
						<div className={cls.userInfo}>
							<Text
								title={authData.username}
								text={t("profile.memberSince", "Member since 2024")}
							/>
							<Button
								theme={ButtonTheme.OUTLINE}
								onClick={handleLogout}
								className={cls.logoutButton}
							>
								{t("profile.logout", "Logout")}
							</Button>
						</div>
					</div>

					<div className={cls.section}>
						<Text title={t("profile.personalInfo", "Personal Information")} />
						<div className={cls.form}>
							<div className={cls.inputGroup}>
								<label className={cls.label}>
									{t("profile.email", "Email")}
								</label>
								<Input
									placeholder={t("profile.email", "Email")}
									value={email}
									onChange={setEmail}
								/>
							</div>
							<div className={cls.inputGroup}>
								<label className={cls.label}>
									{t("profile.phone", "Phone")}
								</label>
								<Input
									placeholder={t("profile.phone", "Phone")}
									value={phone}
									onChange={setPhone}
								/>
							</div>
							<textarea
								className={cls.textarea}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder={t("profile.bio", "Bio")}
								rows={4}
							/>
							<Button className={cls.saveButton}>
								{t("profile.save", "Save Changes")}
							</Button>
						</div>
					</div>

					<div className={cls.stats}>
						<div className={cls.statItem}>
							<Text
								title="1,234"
								text={t("profile.totalTrades", "Total Trades")}
							/>
						</div>
						<div className={cls.statItem}>
							<Text title="$45,678" text={t("profile.totalPnl", "Total P&L")} />
						</div>
						<div className={cls.statItem}>
							<Text title="87%" text={t("profile.winRate", "Win Rate")} />
						</div>
					</div>
				</Card>
			</div>
		</Page>
	);
};

export const ProfilePage = memo(ProfilePageComponent);
