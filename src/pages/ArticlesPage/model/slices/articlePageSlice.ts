import {
	createEntityAdapter,
	createSlice,
	EntityState,
	PayloadAction,
} from "@reduxjs/toolkit";
import { StateSchema } from "app/providers/StoreProvider";
import { Article, ArticleView } from "entities/Article";
import { ArticlesPageSchema } from "../types/articlePageSchema";
import { fetchArticlesList } from "../services/fetchArticlesList/fetchArticlesList";
import { ARTICLE_VIEW_LOCALSTORAGE_KEY } from "shared/const/localstorage";
import { ArticleSortField } from "entities/Article/model/types/article";
import { SortOrder } from "shared/types";

const articlesAdapter = createEntityAdapter<Article>({
	selectId: (article: Article) => article.id,
});

export const getArticles = articlesAdapter.getSelectors<StateSchema>(
	(state) => state.articlesPage || articlesAdapter.getInitialState()
);

const articlePageSlice = createSlice({
	name: "articlePageSlice",
	initialState: articlesAdapter.getInitialState<ArticlesPageSchema>({
		isLoading: false,
		ids: [],
		error: undefined,
		entities: {},
		page: 1,
		hasMore: true,
		view: ArticleView.SMALL,
		limit: 9,
		sort: ArticleSortField.CREATED,
		search: "",
		order: "asc",
		_inited: false,
	}),
	reducers: {
		setView: (state, action: PayloadAction<ArticleView>) => {
			state.view = action.payload;
			localStorage.setItem(ARTICLE_VIEW_LOCALSTORAGE_KEY, action.payload);
		},
		setPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
		setOrder: (state, action: PayloadAction<SortOrder>) => {
			state.order = action.payload;
		},
		setSort: (state, action: PayloadAction<ArticleSortField>) => {
			state.sort = action.payload;
		},
		setSearch: (state, action: PayloadAction<string>) => {
			state.search = action.payload;
		},
		initState: (state) => {
			const view = localStorage.getItem(
				ARTICLE_VIEW_LOCALSTORAGE_KEY
			) as ArticleView;
			state.view = view;
			state.limit = view === ArticleView.BIG ? 4 : 9;
			state._inited = true;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchArticlesList.pending, (state) => {
				state.error = undefined;
				state.isLoading = true;
			})
			.addCase(
				fetchArticlesList.fulfilled,
				(state, action: PayloadAction<Article[]>) => {
					state.isLoading = false;
					articlesAdapter.addMany(state, action.payload);
					state.hasMore = action.payload.length > 0;
				}
			)
			.addCase(fetchArticlesList.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			});
	},
});

export const { reducer: articlePageReducer, actions: articlePageActions } =
	articlePageSlice;
