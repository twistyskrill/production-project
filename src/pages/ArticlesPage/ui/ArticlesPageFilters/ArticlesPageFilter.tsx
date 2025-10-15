import { classNames } from "shared/lib/classNames/classNames";
import cls from "./ArticlesPageFilter.module.scss";
import { useTranslation } from "react-i18next";
import { memo, useCallback, useMemo } from "react";
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
	getArticlesPageType,
	getArticlesPageView,
} from "pages/ArticlesPage/model/selectors/articlesPageSelector";
import { Card } from "shared/ui/Card/Card";
import { Input } from "shared/ui/Input/Input";
import { SortOrder } from "shared/types";
import { fetchArticlesList } from "pages/ArticlesPage/model/services/fetchArticlesList/fetchArticlesList";
import { useDebounce } from "shared/lib/hooks/useDebounce/useDebounce";
import { TabItem, Tabs } from "shared/ui/Tabs/Tabs";
import { ArticleType } from "entities/Article/model/types/article";
import { ArticleTypeTabs } from "entities/Article/ui/ArticleTypeTabs/ArticleTypeTabs";

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
	const type = useSelector(getArticlesPageType);

	const fetchData = useCallback(() => {
		dispatch(fetchArticlesList({ replace: true }));
	}, [dispatch]);

	const debouncedFetchData = useDebounce(fetchData, 500);

	const onChangeView = useCallback(
		(view: ArticleView) => {
			dispatch(articlePageActions.setView(view));
		},
		[dispatch]
	);

	const onChangeSort = useCallback(
		(newSort: ArticleSortField) => {
			dispatch(articlePageActions.setSort(newSort));
			dispatch(articlePageActions.setPage(1));
			fetchData();
		},
		[dispatch, fetchData]
	);

	const onChangeOrder = useCallback(
		(newOrder: SortOrder) => {
			dispatch(articlePageActions.setOrder(newOrder));
			dispatch(articlePageActions.setPage(1));
			fetchData();
		},
		[dispatch, fetchData]
	);

	const onChangeSearch = useCallback(
		(search: string) => {
			dispatch(articlePageActions.setSearch(search));
			dispatch(articlePageActions.setPage(1));
			debouncedFetchData();
		},
		[dispatch, debouncedFetchData]
	);
	const onChangeType = useCallback(
		(value: ArticleType) => {
			dispatch(articlePageActions.setType(value));
			dispatch(articlePageActions.setPage(1));
			fetchData();
		},
		[dispatch, fetchData]
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
			<ArticleTypeTabs
				className={cls.tabs}
				value={type}
				onChangeType={onChangeType}
			/>
		</div>
	);
});
