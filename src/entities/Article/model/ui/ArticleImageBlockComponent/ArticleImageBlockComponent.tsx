import { classNames } from "shared/lib/classNames/classNames";
import cls from "./ArticleImageBlockComponent.module.scss";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { ArticleImageBlock } from "../../types/article";
import { Text, TextAlign } from "shared/ui/Text/Text";

interface ArticleImageBlockComponentProps {
	className?: string;
	block: ArticleImageBlock;
}

export const ArticleImageBlockComponent = memo(
	(props: ArticleImageBlockComponentProps) => {
		const { className, block } = props;
		const { t } = useTranslation();
		return (
			<div
				className={classNames(cls.ArticleImageBlockComponent, {}, [className])}
			>
				<img src={block.src} alt={block.title} className={cls.img} />
				{block.title && <Text text={block.title} align={TextAlign.CENTER} />}
			</div>
		);
	}
);
