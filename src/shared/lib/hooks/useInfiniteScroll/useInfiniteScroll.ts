import { MutableRefObject, useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
	callback?: () => void;
	triggerRef: MutableRefObject<HTMLElement>;
	wrapperRef: MutableRefObject<HTMLElement>;
}

export function useInfiniteScroll({
	callback,
	wrapperRef,
	triggerRef,
}: UseInfiniteScrollOptions) {
	useEffect(() => {
		const wrapperElement = wrapperRef.current;
		const triggetElement = triggerRef.current;
		let observer: IntersectionObserver | null = null;
		if (callback) {
			const options = {
				root: wrapperElement,
				rootMargin: "0px",
				threshold: 1.0,
			};

			observer = new IntersectionObserver(([entry]) => {
				if (entry.isIntersecting) {
					callback();
				}
			}, options);
			observer.observe(triggetElement);
		}

		return () => {
			if (observer && triggetElement) {
				observer.unobserve(triggetElement);
			}
		};
	}, [triggerRef, wrapperRef, callback]);
}
