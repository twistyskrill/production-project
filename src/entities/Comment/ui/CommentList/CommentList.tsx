import { classNames } from "shared/lib/classNames/classNames";
import cls from "./CommentList.module.scss";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { Comment } from "entities/Comment/model/types/comment";
import { Text } from "shared/ui/Text/Text";
import { CommentCard } from "../CommentCard/CommentCard";

interface CommentListProps {
	className?: string;
	comments?: Comment[];
	isLoading?: boolean;
}

export const CommentList = memo((props: CommentListProps) => {
	const { className, isLoading, comments } = props;
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div className={classNames(cls.CommentList, {}, [className])}>
				<CommentCard isLoading />
				<CommentCard isLoading />
				<CommentCard isLoading />
			</div>
		);
	}
	return (
		<div className={classNames(cls.CommentList, {}, [className])}>
			{comments?.length ? (
				comments.map((comment) => (
					<CommentCard
						isLoading={isLoading}
						className={cls.comment}
						comment={comment}
					/>
				))
			) : (
				<Text text={t("Комментарии отсутствуют")} />
			)}
		</div>
	);
});
