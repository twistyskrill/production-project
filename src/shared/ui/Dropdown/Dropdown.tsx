import { Menu } from "@headlessui/react";
import cls from "./Dropdown.module.scss";
import { classNames } from "shared/lib/classNames/classNames";
import { Fragment } from "react/jsx-runtime";
import { ReactNode } from "react";
import { DropdownDirection } from "shared/types/ui";
import { AppLink } from "../AppLink/AppLink";

export interface DropdownItem {
	disabled?: boolean;
	content?: ReactNode;
	onClick?: () => void;
	href?: string;
}

interface DropdownProps {
	className?: string;
	items: DropdownItem[];
	trigger: ReactNode;
	direction?: DropdownDirection;
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

export function Dropdown(props: DropdownProps) {
	const { className, trigger, items, direction = "bottom right" } = props;

	const menuClasses = [getDirectionClass(direction)];
	return (
		<Menu
			as={"div"}
			className={classNames(cls?.Dropdown || "", {}, [className])}
		>
			<Menu.Button className={cls?.btn || ""}>{trigger}</Menu.Button>
			<Menu.Items className={classNames(cls?.menu || "", {}, menuClasses)}>
				{items.map((item) => {
					const content = ({ active }: { active: boolean }) => (
						<button
							type="button"
							onClick={item.onClick}
							className={classNames(cls?.item || "", {
								[cls?.active || ""]: active,
							})}
							disabled={item.disabled}
						>
							{item.content}
						</button>
					);

					if (item.href) {
						return (
							<Menu.Item as={AppLink} to={item.href} disabled={item.disabled}>
								{content}
							</Menu.Item>
						);
					}
					return (
						<Menu.Item as={Fragment} disabled={item.disabled}>
							{content}
						</Menu.Item>
					);
				})}
			</Menu.Items>
		</Menu>
	);
}
