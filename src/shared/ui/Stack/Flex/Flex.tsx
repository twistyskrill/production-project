import { classNames, Mods } from "shared/lib/classNames/classNames";
import cls from "./Flex.module.scss";
import { memo, ReactNode } from "react";

export type FlexJustify = "start" | "center" | "end" | "between";
export type FlexAlign = "start" | "center" | "end";
export type FlexDirection = "row" | "column";
export type FlexGap = "4" | "8" | "16" | "32";

const getJustifyClass = (justify: FlexJustify): string => {
	if (!cls) return "";
	const map: Record<FlexJustify, keyof typeof cls> = {
		start: "justifyStart",
		center: "justifyCenter",
		end: "justifyEnd",
		between: "justifyBetween",
	};
	return cls[map[justify]] || "";
};

const getAlignClass = (align: FlexAlign): string => {
	if (!cls) return "";
	const map: Record<FlexAlign, keyof typeof cls> = {
		start: "alignStart",
		center: "alignCenter",
		end: "alignEnd",
	};
	return cls[map[align]] || "";
};

const getDirectionClass = (direction: FlexDirection): string => {
	if (!cls) return "";
	const map: Record<FlexDirection, keyof typeof cls> = {
		row: "directionRow",
		column: "directionColumn",
	};
	return cls[map[direction]] || "";
};

const getGapClass = (gap: FlexGap): string => {
	if (!cls) return "";
	const map: Record<FlexGap, keyof typeof cls> = {
		"4": "gap4",
		"8": "gap8",
		"16": "gap16",
		"32": "gap32",
	};
	return cls[map[gap]] || "";
};

export interface FlexProps {
	className?: string;
	children: ReactNode;
	justify?: FlexJustify;
	align?: FlexAlign;
	direction?: FlexDirection;
	gap?: FlexGap;
	max?: boolean;
}

export const Flex = memo((props: FlexProps) => {
	const {
		className,
		children,
		justify = "start",
		align = "center",
		direction = "row",
		gap,
		max,
	} = props;

	const classes = [
		className,
		getJustifyClass(justify),
		getAlignClass(align),
		getDirectionClass(direction),
		gap && getGapClass(gap),
	].filter(Boolean);

	const mods: Mods = {
		[cls?.max || ""]: max,
	};

	return (
		<div className={classNames(cls?.Flex || "", mods, classes)}>{children}</div>
	);
});
