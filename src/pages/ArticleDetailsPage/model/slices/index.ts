import { combineReducers } from "@reduxjs/toolkit";
import { ArticleDetailsPageSchema } from "../types";
import { articleDetailsPageRecomendationReducer } from "./articleDetailsPageRecomendationSlice";
import { arcticleDetailsCommentsReducer } from "./articleDetailsCommentsSlice";

export const articleDetailsPageReducer =
	combineReducers<ArticleDetailsPageSchema>({
		recommendations: articleDetailsPageRecomendationReducer,
		comments: arcticleDetailsCommentsReducer,
	});
