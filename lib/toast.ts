import { toast as sonnerToast } from 'sonner';

/**
 * Global toast utility functions
 * Usage:
 * - toast.success("Operation successful!")
 * - toast.error("Something went wrong")
 */

export const toast = {
	success: (message: string) => {
		sonnerToast.success(message);
	},
	error: (message: string) => {
		sonnerToast.error(message);
	},
	info: (message: string) => {
		sonnerToast.info(message);
	},
	warning: (message: string) => {
		sonnerToast.warning(message);
	},
};
