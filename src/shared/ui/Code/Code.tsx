import { classNames } from "shared/lib/classNames/classNames";
import cls from "./Code.module.scss";
import { useTranslation } from "react-i18next";
import { memo, ReactNode, useCallback } from "react";
import { Button, ButtonTheme } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import CopyIcon from "shared/assets/icons/copy-20-20.svg";
interface CodeProps {
	className?: string;
	text: string;
}

export const Code = memo((props: CodeProps) => {
	const { className, text } = props;
	const onCopy = useCallback(() => {
		navigator.clipboard.writeText(text);
	}, [text]);
	return (
		<pre className={classNames(cls?.Code || "", {}, [className])}>
			<Button
				onClick={onCopy}
				className={cls?.copyBtn || ""}
				theme={ButtonTheme.CLEAR}
			>
				<CopyIcon className={cls?.CopyIcon || ""} />
			</Button>
			<code>{text}</code>
		</pre>
	);
});
