import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import StatCard from '../../components/StatCard';
import { Users, ClipboardList, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const CaretakerDashboard = () => {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ['caretaker-analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/caretaker');
      return res.data.data;
    }
  });

  const { data: residentsData } = useQuery({
    queryKey: ['caretaker-residents', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/residents?limit=20&caretakerId=${user?.id}`);
      return res.data.data?.residents || [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.firstName} {user?.lastName}</p>
        </div>
        <Link to="/caretaker/tasks" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          Log Today's Tasks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Assigned Residents" value={analytics?.assignedResidentsCount ?? 0} icon={Users} />
        <StatCard title="Tasks Due Today" value={analytics?.tasksDueToday ?? 0} icon={ClipboardList} className="border-orange-100 bg-orange-50/10" />
        <StatCard title="Tasks Completed Today" value={analytics?.completedTasksToday ?? 0} icon={CheckCircle} className="border-green-100 bg-green-50/10" />
      </div>

      {/* My Residents */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">My Assigned Residents</h2>
          <Link to="/caretaker/tasks" className="text-sm text-blue-600 hover:underline">Log tasks →</Link>
        </div>
        {residentsData?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {residentsData.map((r: any) => (
              <Link key={r._id} to={`/residents/${r._id}`} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                    {r.firstName[0]}{r.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700">{r.firstName} {r.lastName}</p>
                    <p className="text-xs text-slate-500">Room {r.roomNumber}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-blue-600 group-hover:underline">View Profile →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No residents assigned yet.</p>
            <p className="text-xs text-slate-400 mt-1">Contact your administrator to get assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaretakerDashboard;
