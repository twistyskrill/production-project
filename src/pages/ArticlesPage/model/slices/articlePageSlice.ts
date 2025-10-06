import {
	createEntityAdapter,
	createSlice,
	EntityState,
	PayloadAction,
} from "@reduxjs/toolkit";
import { StateSchema } from "app/providers/StoreProvider";
import { Article, ArticleView } from "entities/Article";
import { Comment } from "entities/Comment";
import { ArticlesPageSchema } from "../types/articlePageSchema";
import { fetchArticlesList } from "../services/fetchArticlesList/fetchArticlesList";
import { ARTICLE_VIEW_LOCALSTORAGE_KEY } from "shared/const/localstorage";

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
		view: ArticleView.SMALL,
	}),
	reducers: {
		setView: (state, action: PayloadAction<ArticleView>) => {
			state.view = action.payload;
			localStorage.setItem(ARTICLE_VIEW_LOCALSTORAGE_KEY, action.payload);
		},
		initState: (state) => {
			state.view = localStorage.getItem(
				ARTICLE_VIEW_LOCALSTORAGE_KEY
			) as ArticleView;
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
					articlesAdapter.setAll(state, action.payload);
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
