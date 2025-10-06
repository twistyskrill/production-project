import { classNames } from "shared/lib/classNames/classNames";
import cls from "./ArticlesPage.module.scss";
import { useTranslation } from "react-i18next";
import { memo, useCallback } from "react";
import { ArticleList } from "entities/Article/ui/ArticleList/ArticleList";
import {
	DynamicModuleLoader,
	ReducersList,
} from "shared/lib/components/DynamicModuleLoader/DynamicModuleLoader";
import { articleDetailsReducer } from "entities/Article/model/slice/articleDetailsSlice";
import { useInitialEffect } from "shared/lib/hooks/useInitialEffect/useInitialEffect";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import { fetchArticlesList } from "pages/ArticlesPage/model/services/fetchArticlesList/fetchArticlesList";
import { useSelector } from "react-redux";
import {
	articlePageActions,
	articlePageReducer,
	getArticles,
} from "pages/ArticlesPage/model/slices/articlePageSlice";
import {
	getArticlesPageError,
	getArticlesPageIsLoading,
	getArticlesPageView,
} from "pages/ArticlesPage/model/selectors/articlesPageSelector";
import { ArticleView, ArticleViewSelector } from "entities/Article";

interface ArticlesPageProps {
	className?: string;
}

const reducers: ReducersList = {
	articlesPage: articlePageReducer,
};

const ArticlesPage = ({ className }: ArticlesPageProps) => {
	const { t } = useTranslation("article");
	const dispatch = useAppDispatch();
	const articles = useSelector(getArticles.selectAll);
	const isLoading = useSelector(getArticlesPageIsLoading);
	const error = useSelector(getArticlesPageError);
	const view = useSelector(getArticlesPageView);

	const onChangeView = useCallback(
		(view: ArticleView) => {
			dispatch(articlePageActions.setView(view));
		},
		[dispatch]
	);

	useInitialEffect(() => {
		dispatch(fetchArticlesList());
		dispatch(articlePageActions.initState());
	});

	return (
		<DynamicModuleLoader reducers={reducers}>
			<div className={classNames(cls.ArticlesPage, {}, [className])}>
				<ArticleViewSelector view={view} onViewClick={onChangeView} />
				<ArticleList isLoading={isLoading} view={view} articles={articles} />
			</div>
		</DynamicModuleLoader>
	);
};

export default memo(ArticlesPage);
