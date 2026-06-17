import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import StatCard from '../../components/StatCard';
import { Users, Activity, Pill, AlertCircle, UserCheck, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/admin');
      return res.data.data;
    }
  });

  const { data: weeklyTrends } = useQuery({
    queryKey: ['admin-weekly-trends'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/admin/weekly-trends');
      return res.data.data;
    }
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/activity-feed?limit=10');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facility Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live data from your facility's database</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Residents" value={analytics?.totalResidents ?? 0} icon={Users} />
        <StatCard title="Active Caretakers" value={analytics?.totalCaretakers ?? 0} icon={UserCheck} />
        <StatCard title="Active Medications" value={analytics?.activeMedications ?? 0} icon={Pill} />
        <StatCard title="Unread Notifications" value={analytics?.pendingNotifications ?? 0} icon={AlertCircle} className="border-red-100 bg-red-50/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Weekly Activity</h2>
          <p className="text-xs text-slate-400 mb-4">Admissions and care logs logged per day (7 days)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="admissions" name="New Admissions" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="careLogs" name="Care Logs" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Activity Feed</h2>
          {isActivitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-3">
                  <div className="rounded-full bg-slate-200 h-8 w-8 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {activities?.map((activity: any) => (
                <div key={activity._id} className="flex gap-3 items-start text-sm">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full mt-0.5 flex-shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-slate-800 text-xs leading-snug">
                      <span className="font-semibold">{activity.userId?.firstName}</span> {activity.action}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(activity.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-8">No recent activity.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Admissions */}
      {analytics?.recentAdmissions?.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" /> Recent Admissions
            </h2>
            <Link to="/admin/residents" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.recentAdmissions.map((r: any) => (
              <Link key={r._id} to={`/residents/${r._id}`} className="p-3 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs mb-2">
                  {r.firstName[0]}{r.lastName[0]}
                </div>
                <p className="font-medium text-slate-900 text-sm">{r.firstName} {r.lastName}</p>
                <p className="text-xs text-slate-500">Room {r.roomNumber}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(r.admissionDate).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
