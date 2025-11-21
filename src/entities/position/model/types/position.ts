export enum PositionStatus {
	OPEN = "open",
	CLOSED = "closed",
	CLOSING = "closing",
}

export enum PositionDirection {
	LONG = "long",
	SHORT = "short",
}

export enum PositionSortField {
	SYMBOL = "symbol",
	PNL = "pnl",
	SIZE = "size",
	UPDATED_AT = "updatedAt",
}

export interface Position {
	id: string;
	symbol: string;
	description: string;
	size: number;
	direction: PositionDirection;
	entryPrice: number;
	markPrice: number;
	pnl: number;
	pnlPercent: number;
	currency: string;
	openedAt: string;
	updatedAt: string;
	status: PositionStatus;
	strategy: string;
	tags: string[];
}

export interface PositionsFilters {
	query: string;
	statuses: PositionStatus[];
	symbol?: string;
	minPnl?: number;
	maxPnl?: number;
}

export interface PositionsSort {
	field: PositionSortField;
	order: "asc" | "desc";
}

export interface PositionsSchema {
	filters: PositionsFilters;
	sort: PositionsSort;
	virtualization: {
		rowHeight: number;
	};
}
