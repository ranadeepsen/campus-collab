export default function SavedPage() {
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main mb-1">Saved</h1>
          <p className="text-muted">Your bookmarked posts and events.</p>
        </div>
      </div>
      <div className="bg-surface rounded-2xl p-10 shadow-sm border border-border-light text-center">
        <p className="text-muted">You haven&apos;t saved anything yet.</p>
      </div>
    </div>
  );
}
