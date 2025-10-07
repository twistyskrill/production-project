import { createAsyncThunk } from "@reduxjs/toolkit";
import { ThunkConfig } from "app/providers/StoreProvider";
import { Article } from "entities/Article";
import { Comment } from "entities/Comment";
import {
	getArticlesPageHasMore,
	getArticlesPageIsLoading,
	getArticlesPageLimit,
	getArticlesPageNum,
} from "../../selectors/articlesPageSelector";
import { articlePageActions } from "../../slices/articlePageSlice";
import { fetchArticlesList } from "../fetchArticlesList/fetchArticlesList";

interface FetchNextArticlesPageProps {
	page?: number;
}

export const fetchNextArticlesPage = createAsyncThunk<
	void,
	void,
	ThunkConfig<string>
>("articlePage/fetchNextArticlesPage", async (_, thunkApi) => {
	const { extra, dispatch, getState } = thunkApi;

	const limit = getArticlesPageLimit(getState());
	const hasMore = getArticlesPageHasMore(getState());
	const page = getArticlesPageNum(getState());
	const isLoading = getArticlesPageIsLoading(getState());
	if (hasMore && !isLoading) {
		dispatch(articlePageActions.setPage(page + 1));
		dispatch(
			fetchArticlesList({
				page: page + 1,
			})
		);
	}
});
