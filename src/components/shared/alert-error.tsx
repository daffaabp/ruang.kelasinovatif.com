import { X } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertErrorProps {
	show: boolean;
	message?: string;
	onClose?: () => void;
}

export function AlertError({ show, message, onClose }: AlertErrorProps) {
	if (!message) return null;

	return (
		<AnimatePresence mode="wait">
			{show && (
				<motion.div
					initial={{ opacity: 0, y: -5, scale: 0.98 }}
					animate={{
						opacity: 1,
						y: 0,
						scale: 1,
						transition: {
							duration: 0.15,
							ease: "easeOut",
						},
					}}
					exit={{
						opacity: 0,
						y: -5,
						scale: 0.98,
						transition: {
							duration: 0.1,
							ease: "easeIn",
						},
					}}
					className="relative w-full"
					role="alert"
					aria-live="assertive"
				>
					<motion.div
						className="flex h-10 items-center gap-2 overflow-hidden rounded-md border border-red-500/30 bg-red-500/10 px-3 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-300"
						initial={false}
						animate={{ x: [-2, 2, -1, 1, 0] }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<AlertCircle
							className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-200"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium leading-none">{message}</p>
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="ml-auto rounded-sm p-1 text-red-600 hover:bg-red-500/20 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:text-red-300 dark:hover:bg-red-500/30 dark:hover:text-red-200"
								aria-label="Dismiss error message"
							>
								<X className="h-4 w-4" aria-hidden="true" />
							</button>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
