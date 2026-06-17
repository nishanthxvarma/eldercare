import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import StatCard from '../../components/StatCard';
import { HeartPulse, Activity, ClipboardList, Heart } from 'lucide-react';

const FamilyDashboard = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['family-analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/family');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Heart className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-lg font-semibold text-slate-700">No Linked Resident Yet</h2>
        <p className="text-sm text-slate-500 mt-1">Your account hasn't been linked to a resident. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Family Portal</h1>
        <p className="text-sm text-slate-500 mt-0.5">Stay updated on your loved one's care</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Medication Adherence"
          value={`${analytics.medicationAdherencePercentage ?? 0}%`}
          icon={HeartPulse}
          className={analytics.medicationAdherencePercentage >= 80 ? 'border-green-100 bg-green-50/10' : 'border-red-100 bg-red-50/10'}
        />
        <StatCard title="Recent Health Updates" value={analytics.recentHealthUpdates?.length ?? 0} icon={Activity} />
        <StatCard title="Recent Care Logs" value={analytics.latestCareLogs?.length ?? 0} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Updates */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Recent Health Updates
          </h2>
          <div className="space-y-3">
            {analytics.recentHealthUpdates?.map((hr: any) => (
              <div key={hr._id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {hr.vitals?.bloodPressure && (
                      <p className="text-sm text-slate-700">
                        BP: <span className="font-medium">{hr.vitals.bloodPressure.systolic}/{hr.vitals.bloodPressure.diastolic} mmHg</span>
                      </p>
                    )}
                    {hr.vitals?.heartRate && (
                      <p className="text-sm text-slate-700">Heart Rate: <span className="font-medium">{hr.vitals.heartRate} bpm</span></p>
                    )}
                    {hr.vitals?.oxygenLevel && (
                      <p className="text-sm text-slate-700">O₂: <span className="font-medium">{hr.vitals.oxygenLevel}%</span></p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 text-right">{new Date(hr.recordedAt).toLocaleString()}</p>
                </div>
                {hr.notes && <p className="text-xs text-slate-500 mt-2 italic">{hr.notes}</p>}
              </div>
            ))}
            {!analytics.recentHealthUpdates?.length && (
              <div className="text-center py-6 text-slate-500">
                <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No health records yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Care Logs */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" /> Latest Care Logs
          </h2>
          <div className="space-y-3">
            {analytics.latestCareLogs?.map((log: any) => (
              <div key={log._id} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{log.type}</span>
                  <p className="text-xs text-slate-400">{new Date(log.timestamp || log.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-700 mt-1">{log.description}</p>
                {log.caretakerId && (
                  <p className="text-xs text-slate-400 mt-1">
                    By: {log.caretakerId.firstName} {log.caretakerId.lastName}
                  </p>
                )}
              </div>
            ))}
            {!analytics.latestCareLogs?.length && (
              <div className="text-center py-6 text-slate-500">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No care logs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
