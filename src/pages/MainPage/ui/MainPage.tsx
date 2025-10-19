import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "shared/ui/Input/Input";
import { LisBbox } from "shared/ui/ListBox/ListBox";
import { HStack } from "shared/ui/Stack";
import { Page } from "widgets/Page/Page";

const MainPage = () => {
	const { t } = useTranslation();
	const [value, setValue] = useState("");

	const onChange = (val: string) => {
		setValue(val);
	};

	return (
		<Page>
			{t("Главная страница")}
			<div>
				<HStack>
					<div> asdasd</div>
					<LisBbox
						defaultValue={"Выберите значение"}
						onChange={(value: string) => {}}
						value={undefined}
						items={[
							{ value: "1", content: "123" },
							{ value: "2", content: "asd", disabled: true },
							{ value: "3", content: "12fgfdgdfg3" },
						]}
					/>
				</HStack>
			</div>
		</Page>
	);
};

export default MainPage;
