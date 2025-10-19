import { classNames } from "shared/lib/classNames/classNames";
import cls from "./CountrySelect.module.scss";
import { useTranslation } from "react-i18next";
import { Select } from "shared/ui/Select/Select";
import { Currency } from "entities/Currency/model/types/currency";
import { memo, useCallback, useMemo } from "react";
import { Country } from "../../model/types/country";
import { LisBbox } from "shared/ui/ListBox/ListBox";

interface CountrySelectProps {
	className?: string;
	value?: Country;
	onChange?: (value: Country) => void;
	readonly?: boolean;
}

const options = [
	{ value: Country.Russia, content: Country.Russia },
	{ value: Country.Armenia, content: Country.Armenia },
	{ value: Country.Kazashctan, content: Country.Kazashctan },
	{ value: Country.Belarus, content: Country.Belarus },
	{ value: Country.Ukraine, content: Country.Ukraine },
];

export const CountrySelect = memo(
	({ className, value, onChange, readonly }: CountrySelectProps) => {
		const { t } = useTranslation();

		const onChangeHandler = useCallback(
			(value: string) => {
				onChange?.(value as Country);
			},
			[onChange]
		);

		return (
			<LisBbox
				onChange={onChangeHandler}
				value={value}
				defaultValue={t("Укажите страну")}
				items={options}
				readonly={readonly}
				direction={"top"}
				label={t("Укажите страну")}
			/>
		);
	}
);
