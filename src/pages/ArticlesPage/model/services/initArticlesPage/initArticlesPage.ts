import { createAsyncThunk } from "@reduxjs/toolkit";
import { ThunkConfig } from "app/providers/StoreProvider";
import { getArticlesPageInited } from "../../selectors/articlesPageSelector";
import { articlePageActions } from "../../slices/articlePageSlice";
import { fetchArticlesList } from "../fetchArticlesList/fetchArticlesList";

interface initArticlesPageProps {
	page?: number;
}

export const initArticlesPage = createAsyncThunk<
	void,
	void,
	ThunkConfig<string>
>("articlePage/initArticlesPage", async (_, thunkApi) => {
	const { extra, dispatch, getState } = thunkApi;
	const inited = getArticlesPageInited(getState());

	if (!inited) {
		dispatch(articlePageActions.initState());
		dispatch(
			fetchArticlesList({
				page: 1,
			})
		);
	}
});
