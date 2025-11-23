import { memo } from "react";
import { useOfflineStatus } from "shared/lib/pwa/useOfflineStatus";
import { classNames } from "shared/lib/classNames/classNames";
import cls from "./OfflineIndicator.module.scss";

interface OfflineIndicatorProps {
	className?: string;
}

export const OfflineIndicator = memo(({ className }: OfflineIndicatorProps) => {
	const { isOnline, wasOffline } = useOfflineStatus();

	if (isOnline && !wasOffline) {
		return null;
	}

	return (
		<div
			className={classNames(cls.OfflineIndicator, {}, [className])}
			role="status"
			aria-live="polite"
		>
			{isOnline ? (
				<div className={cls.online}>
					<span className={cls.icon}>✓</span>
					<span>Connection restored</span>
				</div>
			) : (
				<div className={cls.offline}>
					<span className={cls.icon}>⚠</span>
					<span>You are offline. Orders will be queued.</span>
				</div>
			)}
		</div>
	);
});
