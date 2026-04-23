"use server"

import { prisma } from "@/lib/prisma"
import { normalizePhone } from "@/lib/phone-utils"
import { actionClient } from "@/lib/safe-action"
import { createNotification } from "@/app/dashboard/notifications/notification-actions"
import { z } from "zod"
import * as XLSX from "xlsx"
import type {
  ExcelRow,
  GroupedCourseOptions,
  ImportResult,
  ImportRowResult,
} from "./kelola-akses-types"

// ─────────────────────────────────────────────
// 1. Fetch Detail Courses for the course selector
// ─────────────────────────────────────────────
export const getDetailCoursesForImportAction = actionClient.action(
  async (): Promise<GroupedCourseOptions[]> => {
    const categories = await prisma.courses.findMany({
      where: { accessType: "PREMIUM" },
      select: {
        id: true,
        courseName: true,
        CourseDetails: {
          select: {
            id: true,
            title: true,
            courseType: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { courseName: "asc" },
    })

    return categories.map((cat) => ({
      courseId: cat.id,
      courseName: cat.courseName,
      details: cat.CourseDetails.map((d) => ({
        id: d.id,
        title: d.title,
        courseType: d.courseType,
        courseName: cat.courseName,
        courseId: cat.id,
      })),
    }))
  },
)

// ─────────────────────────────────────────────
// 2. Process the import
// ─────────────────────────────────────────────
const excelRowSchema = z.object({
  rowIndex: z.number(),
  no: z.string(),
  nama: z.string(),
  email: z.string(),
  noTelp: z.string(),
  keterangan: z.string(),
})

export const processImportAction = actionClient
  .schema(
    z.object({
      courseDetailId: z.string().min(1),
      rows: z.array(excelRowSchema),
    }),
  )
  .action(async ({ parsedInput }): Promise<ImportResult> => {
    const { courseDetailId, rows } = parsedInput

    if (rows.length === 0) {
      return {
        summary: { total: 0, sukses: 0, skip: 0, gagal: 0 },
        rows: [],
        createdIds: [],
      }
    }

    // ── Collect unique emails and phones from Excel ──────────────────────────
    const excelEmails = [
      ...new Set(
        rows
          .map((r) => r.email.trim().toLowerCase())
          .filter(Boolean),
      ),
    ]
    const excelPhonesNorm = [
      ...new Set(
        rows
          .map((r) => normalizePhone(r.noTelp))
          .filter(Boolean),
      ),
    ]

    // ── Bulk query 1: users by email ─────────────────────────────────────────
    const usersByEmail = await prisma.user.findMany({
      where: { email: { in: excelEmails } },
      select: {
        id: true,
        email: true,
        UserProfile: { select: { phone: true } },
      },
    })

    const emailToUserId = new Map<string, string>()
    for (const u of usersByEmail) {
      emailToUserId.set(u.email.toLowerCase(), u.id)
    }

    // ── Bulk query 2: ALL UserProfiles for phone matching ────────────────────
    // Only do this if there are rows whose email didn't match
    const unmatchedPhones = excelPhonesNorm.filter(Boolean)
    const phoneToUserId = new Map<string, string>()

    if (unmatchedPhones.length > 0) {
      // Fetch all profiles that have a phone (limit overhead for very large DBs
      // by fetching only profiles where phone is not empty)
      const profiles = await prisma.userProfile.findMany({
        where: { phone: { not: "" } },
        select: { userId: true, phone: true },
      })

      for (const p of profiles) {
        const norm = normalizePhone(p.phone)
        if (norm) {
          // Keep first match if duplicates exist
          if (!phoneToUserId.has(norm)) {
            phoneToUserId.set(norm, p.userId)
          }
        }
      }
    }

    // ── Collect all matched userIds ──────────────────────────────────────────
    const matchedUserIds = new Set<string>()
    for (const row of rows) {
      const emailKey = row.email.trim().toLowerCase()
      const phoneNorm = normalizePhone(row.noTelp)
      const uid =
        emailToUserId.get(emailKey) ??
        (phoneNorm ? phoneToUserId.get(phoneNorm) : undefined)
      if (uid) matchedUserIds.add(uid)
    }

    // ── Bulk query 3: existing accesses for the target courseDetail ──────────
    const existingAccesses = await prisma.userCourseDetails.findMany({
      where: {
        courseDetailId,
        userId: { in: [...matchedUserIds] },
      },
      select: { userId: true },
    })
    const usersWithAccess = new Set(existingAccesses.map((a) => a.userId))

    // ── Process each row ─────────────────────────────────────────────────────
    const results: ImportRowResult[] = []
    const toCreate: { userId: string; rowIdx: number }[] = []
    const pendingUserIds = new Set<string>()

    for (const row of rows) {
      const emailKey = row.email.trim().toLowerCase()
      const phoneNorm = normalizePhone(row.noTelp)

      let userId: string | undefined
      let matchedBy = ""

      if (emailKey && emailToUserId.has(emailKey)) {
        userId = emailToUserId.get(emailKey)
        matchedBy = "email"
      } else if (phoneNorm && phoneToUserId.has(phoneNorm)) {
        userId = phoneToUserId.get(phoneNorm)
        matchedBy = "nomor telepon"
      }

      if (!userId) {
        results.push({
          ...row,
          status: "GAGAL",
          detail: "Email dan nomor telepon tidak ditemukan di database",
        })
        continue
      }

      if (usersWithAccess.has(userId)) {
        results.push({
          ...row,
          status: "SKIP",
          detail: "User sudah memiliki akses ke rekaman ini",
        })
        continue
      }

      if (pendingUserIds.has(userId)) {
        results.push({
          ...row,
          status: "SKIP",
          detail: "Baris duplikat di file import (user sudah diproses)",
        })
        continue
      }

      pendingUserIds.add(userId)
      // Mark as to-be-created (we'll bulk-insert later)
      toCreate.push({ userId, rowIdx: row.rowIndex })
      // Temporarily mark as sukses; we'll fill in the ID after createMany
      results.push({
        ...row,
        status: "SUKSES",
        detail: `Akses diberikan (matched by ${matchedBy})`,
      })
    }

    // ── Bulk create new accesses ─────────────────────────────────────────────
    let createdIds: string[] = []
    if (toCreate.length > 0) {
      // createMany doesn't return IDs in MySQL, so we use individual creates
      // in a transaction for atomicity and to get back the IDs.
      const created = await prisma.$transaction(
        toCreate.map(({ userId }) =>
          prisma.userCourseDetails.create({
            data: { userId, courseDetailId },
            select: { id: true, userId: true },
          }),
        ),
      )

      createdIds = created.map((c) => c.id)

      // Attach the newly created IDs back to their result rows
      for (let i = 0; i < toCreate.length; i++) {
        const targetRowIdx = toCreate[i].rowIdx
        const resultRow = results.find((r) => r.rowIndex === targetRowIdx)
        if (resultRow) {
          resultRow.userCourseDetailId = createdIds[i]
        }
      }
    }

    const sukses = results.filter((r) => r.status === "SUKSES").length
    const skip = results.filter((r) => r.status === "SKIP").length
    const gagal = results.filter((r) => r.status === "GAGAL").length

    if (sukses > 0) {
      const detail = await prisma.courseDetails.findUnique({
        where: { id: courseDetailId },
        select: { title: true, course: { select: { courseName: true } } },
      })
      await createNotification(
        "ACCESS_GRANTED",
        "Akses Premium Diberikan",
        `${sukses} user mendapat akses ke "${detail?.title ?? courseDetailId}" (${detail?.course?.courseName ?? ""}).`,
        { courseDetailId, sukses, skip, gagal },
      )
    }

    return {
      summary: { total: rows.length, sukses, skip, gagal },
      rows: results,
      createdIds,
    }
  })

// ─────────────────────────────────────────────
// 3. Undo last import
// ─────────────────────────────────────────────
export const undoLastImportAction = actionClient
  .schema(
    z.object({
      createdIds: z.array(z.string()).min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { createdIds } = parsedInput

    const deleted = await prisma.userCourseDetails.deleteMany({
      where: { id: { in: createdIds } },
    })

    return { deletedCount: deleted.count }
  })

// ─────────────────────────────────────────────
// 4. Generate template Excel for download
// ─────────────────────────────────────────────
export const generateTemplateAction = actionClient.action(async () => {
  // Row 1: title (merged conceptually – just put it in A1)
  // Row 2: empty
  // Row 3: headers
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([
    ["DAFTAR PESERTA KELAS / EVENT"],
    [],
    ["NO", "NAMA", "EMAIL", "NO TELP", "KETERANGAN"],
    [1, "Nama Lengkap Peserta", "email@example.com", "08123456789", "BERBAYAR"],
  ])

  // Set column widths
  ws["!cols"] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 35 },
    { wch: 20 },
    { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
  const base64 = Buffer.from(buffer).toString("base64")

  return {
    data: base64,
    filename: "template-import-akses.xlsx",
  }
})

// ─────────────────────────────────────────────
// 5. Generate Excel report for download
// ─────────────────────────────────────────────
export const generateReportAction = actionClient
  .schema(
    z.object({
      courseDetailTitle: z.string(),
      rows: z.array(
        z.object({
          rowIndex: z.number(),
          no: z.string(),
          nama: z.string(),
          email: z.string(),
          noTelp: z.string(),
          keterangan: z.string(),
          status: z.enum(["SUKSES", "SKIP", "GAGAL"]),
          detail: z.string(),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { courseDetailTitle, rows } = parsedInput

    const reportData = rows.map((r) => ({
      No: r.no,
      Nama: r.nama,
      Email: r.email,
      "No Telepon": r.noTelp,
      Keterangan: r.keterangan,
      Status: r.status,
      Detail: r.detail,
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(reportData)
    ws["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 50 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Import Report")

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
    const base64 = Buffer.from(buffer).toString("base64")

    const safeTitle = courseDetailTitle
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
    const date = new Date().toISOString().split("T")[0]

    return {
      data: base64,
      filename: `report-import-${safeTitle}-${date}.xlsx`,
    }
  })

// ─────────────────────────────────────────────
// 6. Parse uploaded Excel (base64) on server
// ─────────────────────────────────────────────
export const parseExcelAction = actionClient
  .schema(
    z.object({
      base64: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }): Promise<ExcelRow[]> => {
    const buffer = Buffer.from(parsedInput.base64, "base64")
    const wb = XLSX.read(buffer, { type: "buffer" })

    // Always use the first sheet
    const sheetName = wb.SheetNames[0]
    if (!sheetName) throw new Error("File Excel tidak memiliki sheet")

    const ws = wb.Sheets[sheetName]

    // Sheet has: row 1 = title, row 2 = empty, row 3 = headers (NO, NAMA, EMAIL, NO TELP, KETERANGAN)
    // We tell xlsx to start from row 3 (0-indexed row 2) as the header row
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      range: 2, // row index 2 = the 3rd row (0-based) is used as header
      defval: "",
    })

    // Normalize column names to handle different capitalizations / spacing
    const normalize = (key: string) =>
      key.toString().trim().toUpperCase().replace(/\s+/g, " ")

    const rows: ExcelRow[] = rawData
      .map((raw, idx) => {
        const normalized: Record<string, string> = {}
        for (const [k, v] of Object.entries(raw)) {
          normalized[normalize(k)] = String(v ?? "").trim()
        }

        return {
          rowIndex: idx + 4, // actual Excel row number (data starts at row 4)
          no: normalized["NO"] ?? String(idx + 1),
          nama: normalized["NAMA"] ?? "",
          email: normalized["EMAIL"] ?? "",
          noTelp: normalized["NO TELP"] ?? normalized["NOTELP"] ?? normalized["NO. TELP"] ?? "",
          keterangan: normalized["KETERANGAN"] ?? "",
        }
      })
      // Skip completely empty rows
      .filter((r) => r.email || r.noTelp || r.nama)

    return rows
  })
