import { getDetailCoursesForImportAction } from "./kelola-akses-actions"
import { KelolaAksesClient } from "./kelola-akses-client"

export default async function KelolaAksesPage() {
  const result = await getDetailCoursesForImportAction()
  const groupedCourses = result?.data ?? []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Kelola Akses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Import rekap peserta dari Excel untuk memberikan akses rekaman premium secara massal.
        </p>
      </div>

      <KelolaAksesClient groupedCourses={groupedCourses} />
    </div>
  )
}
