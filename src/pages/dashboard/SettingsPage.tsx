import { useAuth } from '@/features/auth/AuthContext'

export default function SettingsPage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Settings</h1>
        <p className="text-stone-500 mt-1 text-sm">Account information and preferences.</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-navy-800">Account</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide">Full name</p>
            <p className="text-sm text-navy-800 font-medium mt-0.5">{profile?.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide">Role</p>
            <p className="text-sm text-navy-800 font-medium mt-0.5 capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide">Member since</p>
            <p className="text-sm text-navy-800 font-medium mt-0.5">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-navy-800">Security</h2>
        <p className="text-sm text-stone-500">
          To change your password, sign out and use the "Forgot password" option on the login page.
        </p>
      </div>

      <div className="card p-6 border-red-100">
        <h2 className="font-semibold text-red-700 mb-3">Sign out</h2>
        <p className="text-sm text-stone-500 mb-4">Sign out of your account on this device.</p>
        <button
          onClick={() => signOut()}
          className="btn-danger"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
