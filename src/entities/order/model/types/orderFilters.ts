/**
 * Типы для фильтров истории ордеров
 */

import { OrderStatus, OrderType, OrderSide } from "./order";

export interface OrderFilters {
	statuses: OrderStatus[];
	types: OrderType[];
	sides: OrderSide[];
	symbol?: string;
	searchQuery?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface OrderSort {
	field: "createdAt" | "symbol" | "quantity" | "price" | "status";
	order: "asc" | "desc";
}
