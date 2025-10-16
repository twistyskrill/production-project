import { combineReducers } from "@reduxjs/toolkit";
import { ArticleDetailsPageSchema } from "../types";
import { arcticleDetailsCommentsReducer } from "./articleDetailsCommentsSlice";
import { articleDetailsPageRecommendationsReducer } from "./articleDetailsPageRecomendationSlice";

export const articleDetailsPageReducer =
	combineReducers<ArticleDetailsPageSchema>({
		recommendations: articleDetailsPageRecommendationsReducer,
		comments: arcticleDetailsCommentsReducer,
	});
