import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";
type ToastProps = Partial<ExternalToast> & { variant?: ToastVariant };

const TOAST_COLORS = {
	default: "rgba(255, 255, 255, 0.9)",
	destructive: "rgb(239, 68, 68)",
	success: "rgb(74, 222, 128)",
	warning: "rgb(250, 204, 21)",
	info: "rgb(96, 165, 250)",
} as const;

const TOAST_TYPES = {
	notification: "default",
	error: "destructive",
	warning: "warning",
	info: "info",
	success: "success",
} as const;

const createToast = (
	message: string,
	variant: ToastVariant,
	options?: ToastProps,
) => {
	sonnerToast(message, {
		position: "top-center",
		duration: 5000,
		invert: true,
		closeButton: false,
		style: {
			background:
				"linear-gradient(145deg, #303030 0%, #1a1a1a 50%, #0a0a0a 100%)",
			color: TOAST_COLORS[variant],
			border: `2px solid ${TOAST_COLORS[variant]}`,
			borderRadius: "9999px",
			textAlign: "center",
			boxShadow: `
				0 0 5px ${TOAST_COLORS[variant]},
				inset -2px -2px 4px rgba(0, 0, 0, 0.9),
				inset 2px 2px 4px rgba(255, 255, 255, 0.05),
				-1px -1px 0px rgba(255, 255, 255, 0.04),
				1px 1px 2px rgba(0, 0, 0, 0.5),
				0 0 8px rgba(0, 0, 0, 0.5),
				inset 0 1px 1px rgba(255, 255, 255, 0.05)
			`,
		},
		unstyled: false,
		classNames: {
			closeButton:
				"!bg-black hover:!bg-black active:!bg-black focus:!bg-black [&]:!bg-black [&]:hover:!bg-black [&]:active:!bg-black [&]:focus:!bg-black [&>svg]:!text-white [&>svg]:!fill-white [&]:!border-black [&]:!border-0 [&_*]:!bg-black data-[type=default]:!bg-black data-[type=success]:!bg-black data-[type=error]:!bg-black data-[type=info]:!bg-black data-[type=warning]:!bg-black",
			toast:
				"!bg-[linear-gradient(145deg,#1a1a1a_0%,#0a0a0a_50%,#000000_100%)] rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.9)] transition-shadow duration-300 text-center flex items-center justify-center",
		},
		...options,
	});
};

export const toast = Object.fromEntries(
	Object.entries(TOAST_TYPES).map(([key, variant]) => [
		key,
		(message: string, options?: ToastProps) =>
			createToast(message, variant as ToastVariant, options),
	]),
) as Record<
	keyof typeof TOAST_TYPES,
	(message: string, options?: ToastProps) => void
>;
