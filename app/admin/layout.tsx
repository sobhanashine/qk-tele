export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real app, you would add authentication middleware here or in middleware.ts
  // to protect all /admin routes.
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dir-rtl font-sans p-8">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-black text-indigo-900">پنل مدیریت کوییز آو کینگز</h1>
      </header>
      {children}
    </div>
  );
}
