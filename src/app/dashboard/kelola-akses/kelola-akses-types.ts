// A row parsed from the uploaded Excel file
export interface ExcelRow {
  rowIndex: number
  no: string
  nama: string
  email: string
  noTelp: string
  keterangan: string
}

// Status of each row after import processing
export type ImportRowStatus = "SUKSES" | "SKIP" | "GAGAL"

export interface ImportRowResult {
  rowIndex: number
  no: string
  nama: string
  email: string
  noTelp: string
  keterangan: string
  status: ImportRowStatus
  // SUKSES: matched by 'email' | 'phone'
  // SKIP: user already has access
  // GAGAL: reason string
  detail: string
  // only present for SUKSES rows (used for undo)
  userCourseDetailId?: string
}

export interface ImportSummary {
  total: number
  sukses: number
  skip: number
  gagal: number
}

export interface ImportResult {
  summary: ImportSummary
  rows: ImportRowResult[]
  // IDs of newly created UserCourseDetails rows (for undo)
  createdIds: string[]
}

// Detail course option for the course selector
export interface DetailCourseOption {
  id: string
  title: string
  courseType: string
  courseName: string
  courseId: string
}

// Grouped by parent Jenis Course
export interface GroupedCourseOptions {
  courseId: string
  courseName: string
  details: DetailCourseOption[]
}
