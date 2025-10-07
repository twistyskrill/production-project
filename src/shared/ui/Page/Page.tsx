import { classNames } from "shared/lib/classNames/classNames";
import cls from "./Page.module.scss";
import { useTranslation } from "react-i18next";
import { memo, MutableRefObject, ReactNode, useRef } from "react";
import { useInfiniteScroll } from "shared/lib/hooks/useInfiniteScroll/useInfiniteScroll";

interface PageProps {
	className?: string;
	children: ReactNode;
	onScrollEnd?: () => void;
}

export const Page = memo((props: PageProps) => {
	const { className, children, onScrollEnd } = props;
	const { t } = useTranslation();
	const wrapperRef = useRef() as MutableRefObject<HTMLDivElement>;
	const triggerRef = useRef() as MutableRefObject<HTMLDivElement>;
	useInfiniteScroll({
		triggerRef,
		wrapperRef,
		callback: onScrollEnd,
	});
	return (
		<section ref={wrapperRef} className={classNames(cls.Page, {}, [className])}>
			{children}
			<div ref={triggerRef} />
		</section>
	);
});
