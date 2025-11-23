import { memo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { randomBetween } from "shared/lib/random/random";
import { Button, ButtonTheme } from "shared/ui/Button/Button";
import { Input } from "shared/ui/Input/Input";
import { Select } from "shared/ui/Select/Select";
import { Modal } from "shared/ui/Modal/Modal";
import { Text } from "shared/ui/Text/Text";
import {
	Order,
	OrderDraft,
	OrderSide,
	OrderStatus,
	OrderTimeInForce,
	OrderType,
	getOrderConfirmation,
	getOrderDraft,
	getOrderError,
	getOrderHistory,
	getOrdersSubmitting,
	orderActions,
} from "entities/order";
import { usePlaceOrderMutation } from "entities/trading/api/tradingApi";
import { mockTradingApi } from "entities/trading/api/mockTradingApi";
import { useAppDispatch } from "shared/lib/hooks/useAppDispatch/useAppDispatch";
import { useOfflineStatus } from "shared/lib/pwa/useOfflineStatus";
import { addOrderToQueue } from "shared/lib/pwa/offlineQueue";
import cls from "./OrderPlacementForm.module.scss";

const orderTypeOptions = [
	{ value: OrderType.MARKET, content: "Market" },
	{ value: OrderType.LIMIT, content: "Limit" },
	{ value: OrderType.STOP, content: "Stop" },
];

const timeInForceOptions = [
	{ value: OrderTimeInForce.GTC, content: "GTC" },
	{ value: OrderTimeInForce.IOC, content: "IOC" },
	{ value: OrderTimeInForce.FOK, content: "FOK" },
];

const sideOptions = [
	{ value: OrderSide.BUY, content: "Buy" },
	{ value: OrderSide.SELL, content: "Sell" },
];

export const OrderPlacementForm = memo(() => {
	const { t } = useTranslation("terminal");
	const dispatch = useAppDispatch();
	const draft = useSelector(getOrderDraft);
	const confirmation = useSelector(getOrderConfirmation);
	const history = useSelector(getOrderHistory);
	const submitting = useSelector(getOrdersSubmitting);
	const error = useSelector(getOrderError);
	const { isOnline } = useOfflineStatus();
	const [placeOrder] = usePlaceOrderMutation();

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<OrderDraft>({
		defaultValues: draft,
	});

	useEffect(() => {
		const subscription = watch((value) => {
			dispatch(orderActions.updateDraft(value));
		});
		return () => subscription.unsubscribe();
	}, [dispatch, watch]);

	const onSubmit = () => {
		dispatch(orderActions.openConfirmation());
	};

	const onConfirm = async () => {
		if (!confirmation) {
			return;
		}
		dispatch(orderActions.setSubmitting(true));

		// Если оффлайн, добавляем в очередь
		if (!isOnline) {
			try {
				const queueId = await addOrderToQueue(confirmation);
				dispatch(orderActions.setOrderError(undefined));
				// Создаем временный ордер для отображения
				const queuedOrder: Order = {
					...confirmation,
					id: queueId,
					status: OrderStatus.PENDING,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
				dispatch(orderActions.pushOrder(queuedOrder));
				dispatch(orderActions.closeConfirmation());
				return;
			} catch (err) {
				dispatch(
					orderActions.setOrderError("Failed to queue order. Please try again.")
				);
				return;
			}
		}

		try {
			const result = await placeOrder(confirmation).unwrap();
			const order = result.order;

			// Добавляем ордер в историю
			dispatch(orderActions.pushOrder(order));

			// Если ордер имеет статус SENT, симулируем обновление статуса через некоторое время
			if (
				order.status === OrderStatus.SENT &&
				result.willSucceed !== undefined
			) {
				setTimeout(() => {
					const finalStatus = result.willSucceed
						? OrderStatus.FILLED
						: OrderStatus.REJECTED;

					// Обновляем статус ордера
					const updatedOrder = {
						...order,
						status: finalStatus,
						executionPrice:
							finalStatus === OrderStatus.FILLED
								? result.executionPrice
								: undefined,
						fillPrice:
							finalStatus === OrderStatus.FILLED
								? result.executionPrice
								: undefined,
						failReason:
							finalStatus === OrderStatus.REJECTED
								? "Risk limits exceeded"
								: undefined,
					};

					dispatch(
						orderActions.markOrderStatus({
							id: order.id,
							status: finalStatus,
						})
					);

					// Если ордер исполнен, создаем позицию
					if (finalStatus === OrderStatus.FILLED && result.executionPrice) {
						mockTradingApi.createPositionFromOrder(
							updatedOrder,
							result.executionPrice
						);
					}
				}, randomBetween(500, 2000)); // Симуляция обработки ордера: 0.5-2 секунды
			}
		} catch (err) {
			dispatch(orderActions.setOrderError((err as Error).message));
		}
	};

	return (
		<form
			className={cls?.OrderPlacementForm || ""}
			onSubmit={handleSubmit(onSubmit)}
		>
			<Text title={t("orders.title", "Order placement")} />
			<div className={cls?.fieldRow || ""}>
				<Controller
					control={control}
					name="symbol"
					rules={{ required: t("orders.required", "Required") as string }}
					render={({ field }) => (
						<Input
							value={field.value}
							onChange={(value) => field.onChange(value)}
							placeholder={t("orders.symbol", "Symbol")}
						/>
					)}
				/>
				<Controller
					control={control}
					name="side"
					render={({ field }) => (
						<Select
							label={t("orders.side", "Side")}
							options={sideOptions}
							value={field.value}
							onChange={(value) => field.onChange(value as OrderSide)}
						/>
					)}
				/>
			</div>

			<div className={cls?.fieldRow || ""}>
				<Controller
					control={control}
					name="type"
					render={({ field }) => (
						<Select
							label={t("orders.type", "Type")}
							options={orderTypeOptions}
							value={field.value}
							onChange={(value) => field.onChange(value as OrderType)}
						/>
					)}
				/>
				<Controller
					control={control}
					name="quantity"
					rules={{
						required: t("orders.required", "Required") as string,
						min: { value: 1, message: t("orders.volumeError", "Volume > 0") },
					}}
					render={({ field }) => (
						<Input
							type="number"
							min={1}
							step="1"
							value={field.value ?? ""}
							onChange={(value) => field.onChange(value ? Number(value) : 0)}
							placeholder={t("orders.quantity", "Quantity")}
						/>
					)}
				/>
			</div>

			{draft.type === OrderType.LIMIT && (
				<div className={cls?.fieldRow || ""}>
					<Controller
						control={control}
						name="price"
						rules={{
							required: t(
								"orders.priceRequired",
								"Price is required"
							) as string,
							min: {
								value: 0.01,
								message: t("orders.pricePositive", "Price > 0"),
							},
						}}
						render={({ field }) => (
							<Input
								type="number"
								step="0.01"
								value={field.value ?? ""}
								onChange={(value) =>
									field.onChange(value ? Number(value) : undefined)
								}
								placeholder={t("orders.price", "Price")}
							/>
						)}
					/>
					<div></div>
				</div>
			)}
			{draft.type === OrderType.STOP && (
				<>
					<div className={cls?.fieldRow || ""}>
						<Controller
							control={control}
							name="stopPrice"
							rules={{
								required: t(
									"orders.stopPriceRequired",
									"Stop price is required"
								) as string,
								min: {
									value: 0.01,
									message: t("orders.pricePositive", "Price > 0"),
								},
							}}
							render={({ field }) => (
								<Input
									type="number"
									step="0.01"
									value={field.value ?? ""}
									onChange={(value) =>
										field.onChange(value ? Number(value) : undefined)
									}
									placeholder={t("orders.stopPrice", "Stop price")}
								/>
							)}
						/>
						<div></div>
					</div>
					{draft.stopPrice && (
						<div className={cls?.fieldRow || ""}>
							<Controller
								control={control}
								name="price"
								rules={{
									required: t(
										"orders.priceRequired",
										"Price is required"
									) as string,
									min: {
										value: 0.01,
										message: t("orders.pricePositive", "Price > 0"),
									},
								}}
								render={({ field }) => (
									<Input
										type="number"
										step="0.01"
										value={field.value ?? ""}
										onChange={(value) =>
											field.onChange(value ? Number(value) : undefined)
										}
										placeholder={t("orders.price", "Limit price")}
									/>
								)}
							/>
							<div></div>
						</div>
					)}
				</>
			)}

			<div className={cls?.fieldRow || ""}>
				<Controller
					control={control}
					name="timeInForce"
					render={({ field }) => (
						<Select
							label={t("orders.tif", "Time in force")}
							options={timeInForceOptions}
							value={field.value}
							onChange={(value) => field.onChange(value as OrderTimeInForce)}
						/>
					)}
				/>
				<Controller
					control={control}
					name="comment"
					render={({ field }) => (
						<Input
							placeholder={t("orders.comment", "Comment")}
							value={field.value ?? ""}
							onChange={(value) => field.onChange(value)}
						/>
					)}
				/>
			</div>

			<div className={cls?.actions || ""}>
				<Button type="submit" disabled={submitting}>
					{submitting
						? t("orders.submitting", "Submitting...")
						: t("orders.submit", "Review order")}
				</Button>
				{error && <span className={cls?.error || ""}>{error}</span>}
			</div>

			<div className={cls?.history || ""}>
				<Text text={t("orders.history", "Recent orders")} />
				{history.slice(0, 4).map((order) => {
					const statusClass =
						order.status === OrderStatus.FILLED
							? cls?.statusFilled || ""
							: order.status === OrderStatus.REJECTED
							? cls?.statusRejected || ""
							: order.status === OrderStatus.SENT ||
							  order.status === OrderStatus.PENDING
							? cls?.statusPending || ""
							: "";
					const statusLabel =
						order.status === OrderStatus.FILLED
							? t("orders.status.filled", "Filled")
							: order.status === OrderStatus.REJECTED
							? t("orders.status.rejected", "Rejected")
							: order.status === OrderStatus.SENT
							? t("orders.status.sent", "Sent")
							: order.status === OrderStatus.PENDING
							? t("orders.status.pending", "Pending")
							: order.status;
					return (
						<div key={order.id} className={cls?.historyItem || ""}>
							<span>
								{order.symbol} · {order.side.toUpperCase()} {order.quantity}
							</span>
							<span className={statusClass}>
								{statusLabel}
								{order.failReason && ` (${order.failReason})`}
							</span>
						</div>
					);
				})}
			</div>

			<Modal
				isOpen={!!confirmation}
				onClose={() => dispatch(orderActions.closeConfirmation())}
			>
				<Text title={t("orders.confirmationTitle", "Confirm order")} />
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<Text
						text={`${confirmation?.side.toUpperCase()} ${
							confirmation?.quantity
						} ${confirmation?.symbol}`}
					/>
					<Text text={`Type: ${confirmation?.type.toUpperCase()}`} />
					{confirmation?.type === OrderType.LIMIT && confirmation?.price && (
						<Text text={`Price: ${confirmation.price.toFixed(2)}`} />
					)}
					{confirmation?.type === OrderType.STOP && (
						<>
							{confirmation?.stopPrice && (
								<Text
									text={`Stop Price: ${confirmation.stopPrice.toFixed(2)}`}
								/>
							)}
							{confirmation?.price && (
								<Text text={`Limit Price: ${confirmation.price.toFixed(2)}`} />
							)}
						</>
					)}
					<Text text={`Time in Force: ${confirmation?.timeInForce}`} />
					{confirmation?.comment && (
						<Text text={`Comment: ${confirmation.comment}`} />
					)}
				</div>
				<div className={cls?.actions || ""}>
					<Button onClick={onConfirm} disabled={submitting}>
						{submitting
							? t("orders.submitting", "Submitting...")
							: t("orders.confirm", "Confirm")}
					</Button>
					<Button
						theme={ButtonTheme.OUTLINE}
						onClick={() => dispatch(orderActions.closeConfirmation())}
						type="button"
					>
						{t("orders.cancel", "Cancel")}
					</Button>
				</div>
			</Modal>

			{errors.symbol && (
				<span className={cls?.error || ""}>{errors.symbol.message}</span>
			)}
			{errors.quantity && (
				<span className={cls?.error || ""}>{errors.quantity.message}</span>
			)}
			{errors.price && (
				<span className={cls?.error || ""}>{errors.price.message}</span>
			)}
			{errors.stopPrice && (
				<span className={cls?.error || ""}>{errors.stopPrice.message}</span>
			)}
		</form>
	);
});
