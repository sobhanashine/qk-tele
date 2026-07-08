import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0; // Dynamic page

export default async function AdminPage() {
  // Fetch stats for dashboard
  const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
  const { count: matchesCount } = await supabaseAdmin.from('matches').select('*', { count: 'exact', head: true });
  const { count: questionsCount } = await supabaseAdmin.from('questions').select('*', { count: 'exact', head: true });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-500 mb-2">تعداد کاربران</h3>
        <p className="text-4xl font-black text-indigo-600">{usersCount || 0}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-500 mb-2">تعداد بازی‌ها</h3>
        <p className="text-4xl font-black text-pink-600">{matchesCount || 0}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-500 mb-2">بانک سوالات</h3>
        <p className="text-4xl font-black text-green-600">{questionsCount || 0}</p>
      </div>

      <div className="col-span-full mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">مدیریت سوالات</h2>
        <p className="text-slate-500 mb-4">در اینجا می‌توانید سوالات جدید اضافه کنید یا سوالات قبلی را ویرایش کنید.</p>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
          افزودن سوال جدید
        </button>
      </div>
    </div>
  );
}
