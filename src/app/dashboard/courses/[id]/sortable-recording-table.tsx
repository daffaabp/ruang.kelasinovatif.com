"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DndContext,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDetailCoursesAction } from "../../detailcourse/detailcourse-actions";
import { updateSortOrderAction } from "../../detailcourse/detailcourse-actions";
import { DetailCourseDeleteDialog } from "../../detailcourse/detailcourse-delete-dialog";
import { DetailCourseEditModal } from "../../detailcourse/detailcourse-edit-modal";
import type { PaginatedResult } from "../../detailcourse/detailcourse-types";

interface CourseOption {
	id: string;
	courseName: string;
}

interface RecordingItem {
	id: string;
	courseId: string;
	title: string;
	description: string;
	courseType: "EBOOK" | "VIDEO";
	videoUrl: string | null;
	downloadUrl: string | null;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
	course: { courseName: string; accessType: "FREE" | "PREMIUM" };
}

interface SortableRowProps {
	item: RecordingItem;
	index: number;
	tableData: PaginatedResult;
	onDataChange: () => void;
	courseOptions: CourseOption[];
}

function SortableRow({
	item,
	index,
	tableData,
	onDataChange,
	courseOptions,
}: SortableRowProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 10 : undefined,
	};

	return (
		<TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted" : ""}>
			<TableCell className="w-10">
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1 rounded"
					aria-label="Drag to reorder"
				>
					<GripVertical className="size-4" />
				</button>
			</TableCell>
			<TableCell className="w-10 text-muted-foreground text-sm">
				{index + 1}
			</TableCell>
			<TableCell className="font-medium">
				<div className="truncate max-w-[200px] lg:max-w-[300px]">{item.title}</div>
			</TableCell>
			<TableCell className="hidden md:table-cell">
				<div className="max-w-[300px] truncate text-sm text-muted-foreground" title={item.description}>
					{item.description}
				</div>
			</TableCell>
			<TableCell>
				<Badge
					variant={item.courseType === "EBOOK" ? "default" : "secondary"}
					className="text-xs"
				>
					{item.courseType === "EBOOK" ? "E-Book" : "Video"}
				</Badge>
			</TableCell>
			<TableCell className="text-right space-x-1">
				<DetailCourseEditModal
					detail={{
						...item,
						videoUrl: item.videoUrl ?? null,
						downloadUrl: item.downloadUrl ?? null,
					}}
					tableData={tableData}
					onDataChange={onDataChange}
					courseOptions={courseOptions}
				/>
				<DetailCourseDeleteDialog
					detail={{
						...item,
						videoUrl: item.videoUrl ?? null,
						downloadUrl: item.downloadUrl ?? null,
					}}
					tableData={tableData}
					onDataChange={onDataChange}
				/>
			</TableCell>
		</TableRow>
	);
}

interface SortableRecordingTableProps {
	initialData: PaginatedResult;
	courseOptions: CourseOption[];
	courseId: string;
}

export function SortableRecordingTable({
	initialData,
	courseOptions,
	courseId,
}: SortableRecordingTableProps) {
	const [items, setItems] = useState<RecordingItem[]>(
		(initialData.data as RecordingItem[]).slice().sort((a, b) => a.sortOrder - b.sortOrder),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState<PaginatedResult>(initialData);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
	);

	const fetchAll = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getDetailCoursesAction({
				page: 1,
				perPage: 200,
				courseId,
			});
			if (result && "data" in result && result.data) {
				const sorted = (result.data.data as RecordingItem[])
					.slice()
					.sort((a, b) => a.sortOrder - b.sortOrder);
				setItems(sorted);
				setTableData(result.data);
				setIsDirty(false);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [courseId]);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = items.findIndex((i) => i.id === active.id);
		const newIndex = items.findIndex((i) => i.id === over.id);
		setItems((prev) => arrayMove(prev, oldIndex, newIndex));
		setIsDirty(true);
	}

	async function handleSave() {
		setIsSaving(true);
		try {
			const updates = items.map((item, index) => ({
				id: item.id,
				sortOrder: index,
			}));
			await updateSortOrderAction({ items: updates, courseId });
			setIsDirty(false);
			await fetchAll();
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-3">
			{isDirty && (
				<div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5">
					<p className="text-sm text-amber-800">
						Urutan belum disimpan. Klik &quot;Simpan Urutan&quot; untuk menyimpan perubahan.
					</p>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSaving}
						className="gap-1.5 shrink-0"
					>
						{isSaving ? (
							<Loader2 className="size-3.5 animate-spin" />
						) : (
							<Save className="size-3.5" />
						)}
						{isSaving ? "Menyimpan..." : "Simpan Urutan"}
					</Button>
				</div>
			)}
			<div className="rounded-md border bg-white">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-10" title="Drag untuk mengatur urutan">
									<GripVertical className="size-4 text-muted-foreground" />
								</TableHead>
								<TableHead className="w-10">No</TableHead>
								<TableHead>Judul</TableHead>
								<TableHead className="hidden md:table-cell">Deskripsi</TableHead>
								<TableHead className="w-[90px]">Tipe</TableHead>
								<TableHead className="w-[100px] text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2 className="size-5 animate-spin" />
											<span>Memuat rekaman...</span>
										</div>
									</TableCell>
								</TableRow>
							) : items.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
										Belum ada rekaman. Klik &quot;+ Tambah Rekaman&quot; untuk menambah.
									</TableCell>
								</TableRow>
							) : (
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<SortableContext
										items={items.map((i) => i.id)}
										strategy={verticalListSortingStrategy}
									>
										{items.map((item, index) => (
											<SortableRow
												key={item.id}
												item={item}
												index={index}
												tableData={tableData}
												onDataChange={fetchAll}
												courseOptions={courseOptions}
											/>
										))}
									</SortableContext>
								</DndContext>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<p className="text-sm text-muted-foreground px-1">
				{items.length} rekaman &nbsp;·&nbsp; Drag baris untuk mengatur urutan tampilan
			</p>
		</div>
	);
}
