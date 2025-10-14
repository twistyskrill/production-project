import { createAsyncThunk } from "@reduxjs/toolkit";
import { ThunkConfig } from "app/providers/StoreProvider";
import { getArticlesPageInited } from "../../selectors/articlesPageSelector";
import { articlePageActions } from "../../slices/articlePageSlice";
import { fetchArticlesList } from "../fetchArticlesList/fetchArticlesList";
import { ArticleSortField } from "entities/Article";
import { SortOrder } from "shared/types";

interface initArticlesPageProps {
	page?: number;
}

export const initArticlesPage = createAsyncThunk<
	void,
	URLSearchParams,
	ThunkConfig<string>
>("articlePage/initArticlesPage", async (searchParams, thunkApi) => {
	const { extra, dispatch, getState } = thunkApi;
	const inited = getArticlesPageInited(getState());

	if (!inited) {
		const orderFromUrl = searchParams.get("order") as SortOrder;
		const searchFromUrl = searchParams.get("search");
		const sortFromUrl = searchParams.get("sort") as ArticleSortField;
		dispatch(articlePageActions.initState());
		dispatch(fetchArticlesList({}));

		if (orderFromUrl) {
			dispatch(articlePageActions.setOrder(orderFromUrl));
		}
		if (searchFromUrl) {
			dispatch(articlePageActions.setSearch(searchFromUrl));
		}
		if (sortFromUrl) {
			dispatch(articlePageActions.setSort(sortFromUrl));
		}
	}
});
