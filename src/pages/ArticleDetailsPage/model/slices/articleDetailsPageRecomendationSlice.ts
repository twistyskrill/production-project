import {
	createEntityAdapter,
	createSlice,
	EntityState,
	PayloadAction,
} from "@reduxjs/toolkit";
import { StateSchema } from "app/providers/StoreProvider";
import { Comment } from "entities/Comment";
import { ArticleDetailsCommentSchema } from "../types/ArticleDetailsCommentSchema";
import { fetchCommentsByArticleId } from "../services/fetchCommentsByArticleId/fetchCommentsByArticleId";
import { ArticleDetailsRecommendationSchema } from "../types/ArticleDetailsRecommendationSchema";
import { Article } from "entities/Article";
import { fetchArticleRecommendations } from "../services/fetchArticleRecommendations/fetchArticleRecommendations";

const recommendationsAdapter = createEntityAdapter<Article>({
	selectId: (article: Article) => article.id,
});

export const getArticleRecommendations =
	recommendationsAdapter.getSelectors<StateSchema>(
		(state) =>
			state.articleDetailsRecommendations ||
			recommendationsAdapter.getInitialState()
	);

const articleDetailsPageRecomendationSlice = createSlice({
	name: "articleDetailsCommentsSlice",
	initialState:
		recommendationsAdapter.getInitialState<ArticleDetailsRecommendationSchema>({
			isLoading: false,
			ids: ["1", "2"],
			error: undefined,
			entities: {},
		}),
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchArticleRecommendations.pending, (state) => {
				state.error = undefined;
				state.isLoading = true;
			})
			.addCase(fetchArticleRecommendations.fulfilled, (state, action) => {
				state.isLoading = false;
				recommendationsAdapter.setAll(state, action.payload);
			})
			.addCase(fetchArticleRecommendations.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			});
	},
});

export const { reducer: articleDetailsPageRecomendationReducer } =
	articleDetailsPageRecomendationSlice;
