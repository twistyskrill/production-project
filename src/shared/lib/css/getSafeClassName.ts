/**
 * Безопасный доступ к классу из CSS модуля
 * @param cssModule - объект CSS модуля
 * @param className - имя класса
 * @returns строка с именем класса или пустая строка
 */
export function getSafeClassName(
	cssModule: Record<string, string> | undefined,
	className: string
): string {
	if (!cssModule) return "";
	return cssModule[className] || "";
}
