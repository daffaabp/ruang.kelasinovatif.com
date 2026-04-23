"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Search,
  RotateCcw,
  Upload,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

import {
  generateReportAction,
  generateTemplateAction,
  parseExcelAction,
  processImportAction,
  undoLastImportAction,
} from "./kelola-akses-actions"
import type {
  ExcelRow,
  GroupedCourseOptions,
  ImportResult,
} from "./kelola-akses-types"

type Step = 1 | 2 | 3 | 4

interface Props {
  groupedCourses: GroupedCourseOptions[]
}

// ─────────────────────────────────────────────────────────────────
// Stepper indicator
// ─────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Pilih Rekaman" },
  { n: 2, label: "Upload Excel" },
  { n: 3, label: "Preview Data" },
  { n: 4, label: "Hasil Import" },
]

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                current > s.n
                  ? "bg-primary text-white"
                  : current === s.n
                  ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {current > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <span
              className={`hidden text-xs sm:block whitespace-nowrap ${
                current === s.n
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-2 mb-4 h-px w-12 sm:w-20 transition-colors ${
                current > s.n ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "SUKSES" | "SKIP" | "GAGAL" }) {
  if (status === "SUKSES")
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        SUKSES
      </Badge>
    )
  if (status === "SKIP")
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        SKIP
      </Badge>
    )
  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">GAGAL</Badge>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────
export function KelolaAksesClient({ groupedCourses }: Props) {
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [selectedDetailId, setSelectedDetailId] = useState<string>("")
  const [selectedDetailTitle, setSelectedDetailTitle] = useState<string>("")
  const [detailSearchQuery, setDetailSearchQuery] = useState("")

  // Step 2
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Step 3
  const [previewRows, setPreviewRows] = useState<ExcelRow[]>([])

  // Step 4
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [undone, setUndone] = useState(false)

  // ── Server action hooks ──────────────────────────────────────────
  const { execute: executeParse, isPending: isParsing } = useAction(
    parseExcelAction,
    {
      onSuccess: ({ data }) => {
        if (!data || data.length === 0) {
          toast.error("Tidak ada data yang ditemukan di file Excel")
          return
        }
        setPreviewRows(data)
        setStep(3)
      },
      onError: () => toast.error("Gagal membaca file Excel. Pastikan formatnya benar."),
    },
  )

  const { execute: executeImport, isPending: isImporting } = useAction(
    processImportAction,
    {
      onSuccess: ({ data }) => {
        if (!data) return
        setImportResult(data)
        setUndone(false)
        setStep(4)
        toast.success(
          `Import selesai: ${data.summary.sukses} sukses, ${data.summary.skip} skip, ${data.summary.gagal} gagal`,
        )
      },
      onError: () => toast.error("Terjadi kesalahan saat memproses import"),
    },
  )

  const { execute: executeUndo, isPending: isUndoing } = useAction(
    undoLastImportAction,
    {
      onSuccess: ({ data }) => {
        setUndone(true)
        toast.success(`Berhasil membatalkan ${data?.deletedCount ?? 0} akses yang baru diberikan`)
      },
      onError: () => toast.error("Gagal membatalkan import"),
    },
  )

  const { execute: executeTemplate, isPending: isDownloadingTemplate } =
    useAction(generateTemplateAction, {
      onSuccess: ({ data }) => {
        if (!data) return
        downloadBase64(data.data, data.filename)
      },
      onError: () => toast.error("Gagal membuat template"),
    })

  const { execute: executeReport, isPending: isDownloadingReport } = useAction(
    generateReportAction,
    {
      onSuccess: ({ data }) => {
        if (!data) return
        downloadBase64(data.data, data.filename)
      },
      onError: () => toast.error("Gagal membuat report"),
    },
  )

  // ── Helpers ──────────────────────────────────────────────────────
  function downloadBase64(base64: string, filename: string) {
    const link = document.createElement("a")
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
    link.download = filename
    link.click()
  }

  async function handleFileSelect(file: File) {
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".csv")
    ) {
      toast.error("Format file tidak didukung. Gunakan .xlsx atau .xls")
      return
    }
    setFileName(file.name)

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    executeParse({ base64 })
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  function resetAll() {
    setStep(1)
    setSelectedDetailId("")
    setSelectedDetailTitle("")
    setDetailSearchQuery("")
    setFileName("")
    setPreviewRows([])
    setImportResult(null)
    setUndone(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const flattenedDetails = useMemo(
    () =>
      groupedCourses.flatMap((group) =>
        group.details.map((detail) => ({
          ...detail,
          courseName: group.courseName,
          label: `${group.courseName} — ${detail.title}`,
        })),
      ),
    [groupedCourses],
  )

  const filteredDetails = useMemo(() => {
    const q = detailSearchQuery.trim().toLowerCase()
    if (!q) return flattenedDetails

    return flattenedDetails.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q)
      const categoryMatch = item.courseName.toLowerCase().includes(q)
      const typeMatch = item.courseType.toLowerCase().includes(q)
      return titleMatch || categoryMatch || typeMatch
    })
  }, [detailSearchQuery, flattenedDetails])

  function handleSelectDetail(detailId: string) {
    const selected = flattenedDetails.find((item) => item.id === detailId)
    if (!selected) return
    setSelectedDetailId(detailId)
    setSelectedDetailTitle(selected.label)
  }

  // ── Render steps ─────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StepIndicator current={step} />

      {/* ─── STEP 1: Pilih Detail Course ─── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white font-bold">
                1
              </span>
              Pilih Rekaman yang Akan Diberi Akses
            </CardTitle>
            <CardDescription>
              Pilih satu rekaman (Detail Course) yang aksesnya ingin Anda berikan secara massal
              kepada peserta dari file Excel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rekaman / Detail Course</label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={detailSearchQuery}
                    onChange={(e) => setDetailSearchQuery(e.target.value)}
                    placeholder="Cari rekaman atau jenis course..."
                    className="pl-9"
                  />
                </div>

                <div className="rounded-md border bg-popover">
                  <div className="max-h-72 overflow-auto p-1">
                    {filteredDetails.length === 0 ? (
                      <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Tidak ada rekaman yang cocok.
                      </p>
                    ) : (
                      filteredDetails.map((detail) => {
                        const isActive = selectedDetailId === detail.id
                        return (
                          <button
                            key={detail.id}
                            type="button"
                            onClick={() => handleSelectDetail(detail.id)}
                            className={`flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">{detail.title}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {detail.courseName}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] py-0 h-4 shrink-0">
                              {detail.courseType}
                            </Badge>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedDetailId && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <span className="font-medium">Dipilih: </span>
                {selectedDetailTitle}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                disabled={!selectedDetailId}
                onClick={() => setStep(2)}
                className="gap-2"
              >
                Lanjut <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 2: Upload Excel ─── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white font-bold">
                2
              </span>
              Upload File Excel Rekap Peserta
            </CardTitle>
            <CardDescription>
              Upload file Excel dengan kolom:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                NO, NAMA, EMAIL, NO TELP, KETERANGAN
              </code>
              . Header harus berada di baris ke-3 (baris 1 = judul, baris 2 = kosong).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected course reminder */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <span className="font-medium text-primary">Rekaman dipilih: </span>
              {selectedDetailTitle}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
              {isParsing ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Membaca file…</p>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drag &amp; drop file Excel di sini
                    </p>
                    <p className="text-xs text-muted-foreground">
                      atau klik untuk memilih file (.xlsx, .xls)
                    </p>
                  </div>
                  {fileName && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      {fileName}
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => executeTemplate()}
                disabled={isDownloadingTemplate}
              >
                {isDownloadingTemplate ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Template Excel
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 3: Preview Data ─── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white font-bold">
                3
              </span>
              Preview Data dari Excel
            </CardTitle>
            <CardDescription>
              Periksa data berikut sebelum dikonfirmasi. Ditemukan{" "}
              <strong>{previewRows.length} baris</strong> data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rekaman reminder */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <span className="font-medium text-primary">Rekaman: </span>
              {selectedDetailTitle}
            </div>

            {/* Preview table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>No Telepon</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow key={row.rowIndex}>
                        <TableCell className="text-muted-foreground text-xs">
                          {row.no}
                        </TableCell>
                        <TableCell className="font-medium">{row.nama || "—"}</TableCell>
                        <TableCell className="text-sm">{row.email || "—"}</TableCell>
                        <TableCell className="text-sm">{row.noTelp || "—"}</TableCell>
                        <TableCell>
                          {row.keterangan ? (
                            <Badge variant="outline" className="text-xs">
                              {row.keterangan}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setPreviewRows([])
                  setFileName("")
                  if (fileInputRef.current) fileInputRef.current.value = ""
                  setStep(2)
                }}
              >
                ← Upload Ulang
              </Button>
              <Button
                onClick={() =>
                  executeImport({
                    courseDetailId: selectedDetailId,
                    rows: previewRows,
                  })
                }
                disabled={isImporting}
                className="gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Konfirmasi Import ({previewRows.length} baris)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 4: Hasil Import ─── */}
      {step === 4 && importResult && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold">{importResult.summary.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Baris</p>
              </CardContent>
            </Card>
            <Card className="text-center border-green-200 bg-green-50">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-green-700">
                  {importResult.summary.sukses}
                </p>
                <p className="text-xs text-green-600 mt-1">Sukses</p>
              </CardContent>
            </Card>
            <Card className="text-center border-yellow-200 bg-yellow-50">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-yellow-700">
                  {importResult.summary.skip}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Sudah Punya Akses</p>
              </CardContent>
            </Card>
            <Card className="text-center border-red-200 bg-red-50">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-red-700">
                  {importResult.summary.gagal}
                </p>
                <p className="text-xs text-red-600 mt-1">Gagal</p>
              </CardContent>
            </Card>
          </div>

          {/* Rekaman info */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <span className="font-medium text-primary">Rekaman: </span>
            {selectedDetailTitle}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                executeReport({
                  courseDetailTitle: selectedDetailTitle,
                  rows: importResult.rows.map((r) => ({
                    rowIndex: r.rowIndex,
                    no: r.no,
                    nama: r.nama,
                    email: r.email,
                    noTelp: r.noTelp,
                    keterangan: r.keterangan,
                    status: r.status,
                    detail: r.detail,
                  })),
                })
              }
              disabled={isDownloadingReport}
            >
              {isDownloadingReport ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Report Excel
            </Button>

            {!undone && importResult.createdIds.length > 0 && (
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() =>
                  executeUndo({ createdIds: importResult.createdIds })
                }
                disabled={isUndoing}
              >
                {isUndoing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Undo Import Ini ({importResult.createdIds.length} akses)
              </Button>
            )}

            {undone && (
              <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-700">
                <XCircle className="h-4 w-4" />
                Import telah dibatalkan — {importResult.createdIds.length} akses dihapus
              </div>
            )}

            <Button className="gap-2 ml-auto" onClick={resetAll}>
              <Upload className="h-4 w-4" />
              Import Lagi
            </Button>
          </div>

          {/* Detail result table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detail Hasil per Baris</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>No Telepon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.rows.map((row) => (
                      <TableRow
                        key={row.rowIndex}
                        className={
                          row.status === "SUKSES"
                            ? "bg-green-50/40"
                            : row.status === "GAGAL"
                            ? "bg-red-50/40"
                            : ""
                        }
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {row.no}
                        </TableCell>
                        <TableCell className="font-medium">{row.nama || "—"}</TableCell>
                        <TableCell className="text-sm">{row.email || "—"}</TableCell>
                        <TableCell className="text-sm">{row.noTelp || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs">
                          {row.status === "SUKSES" ? (
                            <span className="flex items-center gap-1 text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              {row.detail}
                            </span>
                          ) : row.status === "GAGAL" ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-3.5 w-3.5 shrink-0" />
                              {row.detail}
                            </span>
                          ) : (
                            row.detail
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
