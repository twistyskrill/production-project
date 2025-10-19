import { classNames } from "shared/lib/classNames/classNames";
import cls from "./CurrencySelect.module.scss";
import { useTranslation } from "react-i18next";
import { Select } from "shared/ui/Select/Select";
import { Currency } from "../../model/types/currency";
import { memo, useCallback, useMemo } from "react";
import { LisBbox } from "shared/ui/ListBox/ListBox";

interface CurrencySelectProps {
	className?: string;
	value?: Currency;
	onChange?: (value: Currency) => void;
	readonly?: boolean;
}

const options = [
	{ value: Currency.RUB, content: Currency.RUB },
	{ value: Currency.USD, content: Currency.USD },
	{ value: Currency.EUR, content: Currency.EUR },
];

export const CurrencySelect = memo(
	({ className, value, onChange, readonly }: CurrencySelectProps) => {
		const { t } = useTranslation();

		const onChangeHandler = useCallback(
			(value: string) => {
				onChange?.(value as Currency);
			},
			[onChange]
		);

		return (
			<LisBbox
				onChange={onChangeHandler}
				value={value}
				items={options}
				defaultValue={t("Укажите валюту")}
				className={className}
				readonly={readonly}
				direction={"top right"}
				label={t("Укажите валюту")}
			/>
		);
	}
);
