import { useEffect, useState } from "react";

/**
 * A hook that delays updating a value until a specified delay has passed
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
	// State to store the debounced value
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// Set up a timer to update the debounced value after the delay
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Clean up the timer if the value changes before the delay expires
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]); // Re-run the effect if value or delay changes

	return debouncedValue;
}
