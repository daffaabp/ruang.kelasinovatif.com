"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportUsersToExcelAction } from "./user-export-actions";

interface UserExportButtonProps {
	totalUsers: number;
}

export function UserExportButton({ totalUsers }: UserExportButtonProps) {
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		
		try {
			const result = await exportUsersToExcelAction({});
			
			if (result?.data?.success && result.data.data && result.data.filename) {
				// Convert base64 back to blob
				const binaryString = atob(result.data.data);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				
				// Create download link
				const blob = new Blob([bytes], { 
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
				});
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = result.data.filename;
				
				// Trigger download
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
				
				toast.success(`Successfully exported ${result.data.totalUsers} users to Excel`);
			} else {
				toast.error(result?.data?.error || 'Failed to export users');
			}
		} catch (error) {
			console.error('Export error:', error);
			toast.error('An error occurred while exporting users');
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Button 
			onClick={handleExport}
			disabled={isExporting || totalUsers === 0}
			variant="outline"
			className="ml-2"
		>
			{isExporting ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Exporting...
				</>
			) : (
				<>
					<Download className="mr-2 h-4 w-4" />
					Export Excel ({totalUsers} users)
				</>
			)}
		</Button>
	);
} 