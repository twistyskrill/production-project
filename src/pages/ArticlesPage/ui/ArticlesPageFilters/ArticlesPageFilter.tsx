import { classNames } from "shared/lib/classNames/classNames";
import cls from "./ArticlesPageFilter.module.scss";
import { useTranslation } from "react-i18next";
import { memo, useCallback } from "react";
import {
	ArticleSortField,
	ArticleSortSelector,
	ArticleView,
	ArticleViewSelector,
} from "entities/Article";
import { articlePageActions } from "pages/ArticlesPage/model/slices/articlePageSlice";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import { useSelector } from "react-redux";
import {
	getArticlesPageOrder,
	getArticlesPageSearch,
	getArticlesPageSort,
	getArticlesPageView,
} from "pages/ArticlesPage/model/selectors/articlesPageSelector";
import { Card } from "shared/ui/Card/Card";
import { Input } from "shared/ui/Input/Input";
import { SortOrder } from "shared/types";

interface ArticlesPageFilterProps {
	className?: string;
}

export const ArticlesPageFilter = memo((props: ArticlesPageFilterProps) => {
	const { className } = props;
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const view = useSelector(getArticlesPageView);
	const sort = useSelector(getArticlesPageSort);
	const order = useSelector(getArticlesPageOrder);
	const search = useSelector(getArticlesPageSearch);

	const onChangeView = useCallback(
		(view: ArticleView) => {
			dispatch(articlePageActions.setView(view));
		},
		[dispatch]
	);

	const onChangeSort = useCallback(
		(newSort: ArticleSortField) => {
			dispatch(articlePageActions.setSort(newSort));
		},
		[dispatch]
	);

	const onChangeOrder = useCallback(
		(newOrder: SortOrder) => {
			dispatch(articlePageActions.setOrder(newOrder));
		},
		[dispatch]
	);

	const onChangeSearch = useCallback(
		(search: string) => {
			dispatch(articlePageActions.setSearch(search));
		},
		[dispatch]
	);

	return (
		<div className={classNames(cls.ArticlesPageFilter, {}, [className])}>
			<div className={cls.sortWrapper}>
				<ArticleSortSelector
					order={order}
					sort={sort}
					onChangeOrder={onChangeOrder}
					onChangeSort={onChangeSort}
				/>
				<ArticleViewSelector view={view} onViewClick={onChangeView} />
			</div>
			<Card className={cls.search}>
				<Input
					onChange={onChangeSearch}
					placeholder={t("Поиск")}
					value={search}
				/>
			</Card>
		</div>
	);
});
