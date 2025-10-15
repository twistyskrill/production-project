import { classNames } from "shared/lib/classNames/classNames";
import { useTranslation } from "react-i18next";
import { HTMLAttributeAnchorTarget, memo } from "react";
import { ArticleListItemSkeleton } from "entities/Article/ui/ArticleListItem/ArticleListItemSkeleton";
import { Text, TextSize } from "shared/ui/Text/Text";
import { ArticleListItem } from "../ArticleListItem/ArticleListItem";
import cls from "./ArticleList.module.scss";
import { Article, ArticleView } from "../../model/types/article";

interface ArticleListProps {
	className?: string;
	articles: Article[];
	isLoading?: boolean;
	target?: HTMLAttributeAnchorTarget;
	view?: ArticleView;
}

const getSkeletons = (view: ArticleView) =>
	new Array(view === ArticleView.SMALL ? 9 : 3)
		.fill(0)
		.map((item, index) => (
			<ArticleListItemSkeleton className={cls.card} key={index} view={view} />
		));

export const ArticleList = memo((props: ArticleListProps) => {
	const {
		className,
		articles = [],
		view = ArticleView.SMALL,
		isLoading,
		target,
	} = props;
	const { t } = useTranslation();

	// ФИКС: Фильтруем валидные статьи ДО рендеринга
	const validArticles =
		articles?.filter((article) => article && article.id) || [];

	const renderArticle = (article: Article) => (
		<ArticleListItem
			article={article}
			view={view}
			className={cls.card}
			key={article.id}
			target={target}
		/>
	);

	// ФИКС: Используем validArticles вместо articles
	if (!isLoading && validArticles.length === 0) {
		return (
			<div className={classNames(cls.ArticleList, {}, [className, cls[view]])}>
				<Text size={TextSize.L} title={t("Статьи не найдены")} />
			</div>
		);
	}

	return (
		<div className={classNames(cls.ArticleList, {}, [className, cls[view]])}>
			{validArticles.length > 0
				? validArticles.map(renderArticle) // ФИКС: мапим validArticles
				: null}
			{isLoading && getSkeletons(view)}
		</div>
	);
});
