import { memo } from "react";
import { Page } from "widgets/Page/Page";
import { Text } from "shared/ui/Text/Text";
import cls from "./NotFoundPage.module.scss";

const NotFoundPageComponent = () => (
	<Page>
		<div className={cls?.NotFoundPage || ""}>
			<Text title="404" text="Route not found" />
		</div>
	</Page>
);

export const NotFoundPage = memo(NotFoundPageComponent);
