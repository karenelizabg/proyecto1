import { AnnotationProgressDonut } from '../components/dashboard/AnnotationProgressDonut';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { ErrorState } from '../components/dashboard/ErrorState';
import { ObjectsPerClassChart } from '../components/dashboard/ObjectsPerClassChart';
import { RecentUploads } from '../components/dashboard/RecentUploads';
import { StatCard } from '../components/dashboard/StatCard';
import { Sidebar } from '../components/sidebar/Sidebar';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

export function DashboardPage() {
  const summary = useDashboardSummary();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 px-6 py-6 lg:px-10 lg:py-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        </header>

        {summary.status === 'loading' && <DashboardSkeleton />}

        {summary.status === 'error' && <ErrorState message={summary.message} onRetry={summary.reload} />}

        {summary.status === 'success' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Images uploaded" value={summary.data.imagesUploaded} accent="lilac" />
              <StatCard label="Images annotated" value={summary.data.imagesAnnotated} accent="mint" />
              <StatCard label="Bounding boxes" value={summary.data.boundingBoxes} accent="peach" />
              <StatCard label="Categories" value={summary.data.categoriesCount} accent="blue" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ObjectsPerClassChart data={summary.data.objectsPerClass} />
              <AnnotationProgressDonut progress={summary.data.annotationProgress} />
            </div>

            <RecentUploads uploads={summary.data.recentUploads} />
          </div>
        )}
      </main>
    </div>
  );
}
