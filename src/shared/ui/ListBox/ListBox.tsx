import { Fragment, ReactNode, useState } from "react";
import { Listbox as HListBox } from "@headlessui/react";
import cls from "./ListBox.module.scss";
import { classNames, Mods } from "shared/lib/classNames/classNames";
import { Button } from "../Button/Button";
import { HStack } from "../Stack";
import { DropdownDirection } from "shared/types/ui";

export interface ListBoxItem {
	value: string;
	content: ReactNode;
	disabled?: boolean;
}

interface ListBoxProps {
	items?: ListBoxItem[];
	className?: string;
	value?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	readonly?: boolean;
	direction?: DropdownDirection;
	label?: string;
}

const getDirectionClass = (direction: DropdownDirection): string => {
	if (!cls) return "";
	const map: Record<DropdownDirection, keyof typeof cls> = {
		"bottom left": "optionsBottomLeft",
		"bottom right": "optionsBottomRight",
		"top left": "optionsTopLeft",
		"top right": "optionsTopRight",
	};
	return cls[map[direction]] || "";
};
export function LisBbox(props: ListBoxProps) {
	const {
		className,
		items,
		value,
		defaultValue,
		onChange,
		readonly,
		direction = "bottom left",
		label,
	} = props;

	const optionsClasses = [getDirectionClass(direction)];
	return (
		<HStack gap="4">
			{label && <span>{label + ">"}</span>}
			<HListBox
				disabled={readonly}
				className={classNames(cls?.ListBox || "", {}, [className])}
				as={"div"}
				value={value}
				onChange={onChange}
			>
				<HListBox.Button className={cls?.trigger || ""}>
					{value ?? defaultValue}
				</HListBox.Button>
				<HListBox.Options
					className={classNames(cls?.options || "", {}, optionsClasses)}
				>
					{items?.map((item) => (
						<HListBox.Option
							key={item.value}
							value={item.value}
							disabled={item.disabled}
							as={Fragment}
						>
							{({ active, selected }) => (
								<li
									className={classNames(cls?.item || "", {
										[cls?.active || ""]: active,
										[cls?.disabled || ""]: item.disabled,
									})}
								>
									{selected && "!!!"}
									{item.content}
								</li>
							)}
						</HListBox.Option>
					))}
				</HListBox.Options>
			</HListBox>
		</HStack>
	);
}
