export default function AdminSettingsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Admin Settings</h1>
        <p className="text-stone-500 mt-1 text-sm">Platform configuration.</p>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-navy-800 mb-3">Platform Information</h2>
        <div className="space-y-2 text-sm text-stone-600">
          <p><strong>App name:</strong> MenuQR</p>
          <p><strong>Default currency:</strong> PKR</p>
          <p><strong>Version:</strong> 1.0.0</p>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-navy-800 mb-3">Admin access</h2>
        <p className="text-sm text-stone-500">
          Admin accounts must be created directly in the Supabase database by setting <code className="bg-stone-100 px-1 rounded">role = 'admin'</code> in the
          <code className="bg-stone-100 px-1 rounded ml-1">profiles</code> table.
          Never grant admin access through the public UI.
        </p>
      </div>
    </div>
  )
}
