import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import {
  User, Activity, AlertTriangle, Pill, HeartPulse, ArrowLeft,
  Pencil, Trash2, X, ClipboardList
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ResidentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'health' | 'carelogs'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: resident, isLoading } = useQuery({
    queryKey: ['resident', id],
    queryFn: async () => {
      const res = await apiClient.get(`/residents/${id}`);
      return res.data.data;
    }
  });

  const { data: medications } = useQuery({
    queryKey: ['medications', id],
    queryFn: async () => {
      const res = await apiClient.get(`/medications?residentId=${id}`);
      return res.data.data;
    },
    enabled: activeTab === 'medications'
  });

  const { data: healthRecords } = useQuery({
    queryKey: ['health-records', id],
    queryFn: async () => {
      const res = await apiClient.get(`/health-records?residentId=${id}`);
      return res.data.data;
    },
    enabled: activeTab === 'health'
  });

  const { data: careLogs } = useQuery({
    queryKey: ['care-logs', id],
    queryFn: async () => {
      const res = await apiClient.get(`/care-logs?residentId=${id}`);
      return res.data.data;
    },
    enabled: activeTab === 'carelogs'
  });

  const { register, handleSubmit, reset } = useForm<any>();

  const updateMutation = useMutation({
    mutationFn: async (form: any) => {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        roomNumber: form.roomNumber,
        admissionDate: form.admissionDate,
        allergies: form.allergies ? form.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship,
        },
      };
      return apiClient.patch(`/residents/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resident', id] });
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Resident updated!');
      setShowEditModal(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update')
  });

  const deleteMutation = useMutation({
    mutationFn: async () => apiClient.delete(`/residents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Resident deleted');
      navigate('/admin/residents');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete')
  });

  const openEdit = () => {
    reset({
      firstName: resident.firstName,
      lastName: resident.lastName,
      dateOfBirth: resident.dateOfBirth?.split('T')[0],
      gender: resident.gender,
      roomNumber: resident.roomNumber,
      admissionDate: resident.admissionDate?.split('T')[0],
      allergies: resident.allergies?.join(', ') || '',
      emergencyContactName: resident.emergencyContact?.name || '',
      emergencyContactPhone: resident.emergencyContact?.phone || '',
      emergencyContactRelationship: resident.emergencyContact?.relationship || '',
    });
    setShowEditModal(true);
  };

  // Build chart data from health records
  const chartData = healthRecords?.slice().reverse().map((r: any) => ({
    date: new Date(r.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    heartRate: r.vitals?.heartRate,
    bloodSugar: r.vitals?.bloodSugar,
    oxygenLevel: r.vitals?.oxygenLevel,
    temperature: r.vitals?.temperature,
    systolic: r.vitals?.bloodPressure?.systolic,
  }));

  if (isLoading) return <div className="p-8 text-slate-500 animate-pulse">Loading resident details...</div>;
  if (!resident) return <div className="p-8 text-red-500">Resident not found</div>;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'medications', label: 'Medications', icon: Pill },
    { key: 'health', label: 'Health Records', icon: HeartPulse },
    { key: 'carelogs', label: 'Care Logs', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Residents
        </button>
        <div className="flex items-center gap-2">
          <button onClick={openEdit} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex gap-5 items-start">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
          {resident.firstName[0]}{resident.lastName[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{resident.firstName} {resident.lastName}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
            <span>Room: <span className="font-medium text-slate-700">{resident.roomNumber}</span></span>
            <span>Gender: <span className="font-medium text-slate-700 capitalize">{resident.gender?.toLowerCase()}</span></span>
            <span>DOB: <span className="font-medium text-slate-700">{new Date(resident.dateOfBirth).toLocaleDateString()}</span></span>
            <span>Admitted: <span className="font-medium text-slate-700">{new Date(resident.admissionDate).toLocaleDateString()}</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 flex gap-2 items-center mb-4"><User className="w-5 h-5 text-blue-500" /> Emergency Contact</h2>
            <p className="font-medium text-slate-900">{resident.emergencyContact?.name}</p>
            <p className="text-sm text-slate-500 mt-1">{resident.emergencyContact?.relationship}</p>
            <p className="text-sm text-blue-600 mt-1">{resident.emergencyContact?.phone}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 flex gap-2 items-center mb-4"><AlertTriangle className="w-5 h-5 text-red-500" /> Allergies</h2>
            {resident.allergies?.length ? (
              <div className="flex gap-2 flex-wrap">
                {resident.allergies.map((allergy: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full border border-red-100">{allergy}</span>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">No known allergies</p>}
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 flex gap-2 items-center mb-4"><Activity className="w-5 h-5 text-emerald-500" /> Medical History</h2>
            <div className="space-y-3">
              {resident.medicalHistory?.map((history: any, i: number) => (
                <div key={i} className="p-3 border rounded-lg bg-slate-50">
                  <p className="font-medium text-slate-900">{history.condition}</p>
                  {history.notes && <p className="text-sm text-slate-600 mt-1">{history.notes}</p>}
                  {history.diagnosedDate && <p className="text-xs text-slate-400 mt-1">Diagnosed: {new Date(history.diagnosedDate).toLocaleDateString()}</p>}
                </div>
              ))}
              {!resident.medicalHistory?.length && <p className="text-sm text-slate-500">No medical history on record.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Medications</h2>
            <span className="text-sm text-slate-500">{medications?.length || 0} medications</span>
          </div>
          {medications?.length ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Dosage</th>
                  <th className="px-6 py-3">Frequency</th>
                  <th className="px-6 py-3">Prescribed By</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medications.map((med: any) => (
                  <tr key={med._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{med.name}</td>
                    <td className="px-6 py-4 text-slate-600">{med.dosage}</td>
                    <td className="px-6 py-4 text-slate-600">{med.frequency?.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-slate-600">{med.prescribedBy}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${med.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {med.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>No medications assigned.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-6">
          {chartData && chartData.length > 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Vitals Trend</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="bloodSugar" name="Blood Sugar" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="oxygenLevel" name="O₂ Level" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="systolic" name="BP Systolic" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-sm text-center text-slate-500">
              <HeartPulse className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>No health records yet.</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b"><h2 className="font-semibold text-slate-900">Recent Vitals</h2></div>
            {healthRecords?.length ? (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">BP</th>
                    <th className="px-6 py-3 text-left">Heart Rate</th>
                    <th className="px-6 py-3 text-left">Temp (°F)</th>
                    <th className="px-6 py-3 text-left">O₂ %</th>
                    <th className="px-6 py-3 text-left">Sugar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {healthRecords.map((r: any) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-700">{new Date(r.recordedAt).toLocaleString()}</td>
                      <td className="px-6 py-3">{r.vitals?.bloodPressure ? `${r.vitals.bloodPressure.systolic}/${r.vitals.bloodPressure.diastolic}` : '—'}</td>
                      <td className="px-6 py-3">{r.vitals?.heartRate ?? '—'}</td>
                      <td className="px-6 py-3">{r.vitals?.temperature ?? '—'}</td>
                      <td className="px-6 py-3">{r.vitals?.oxygenLevel ?? '—'}</td>
                      <td className="px-6 py-3">{r.vitals?.bloodSugar ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="p-8 text-center text-slate-500 text-sm">No records found.</div>}
          </div>
        </div>
      )}

      {activeTab === 'carelogs' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="p-4 border-b"><h2 className="font-semibold text-slate-900">Care Logs</h2></div>
          {careLogs?.length ? (
            <div className="divide-y divide-slate-100">
              {careLogs.map((log: any) => (
                <div key={log._id} className="p-4 flex gap-3 items-start">
                  <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{log.type}</span>
                      <span className="text-xs text-slate-400">{new Date(log.timestamp || log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700">{log.description}</p>
                    {log.caretakerId && <p className="text-xs text-slate-400 mt-1">By: {log.caretakerId.firstName} {log.caretakerId.lastName}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="p-12 text-center text-slate-500">No care logs yet.</div>}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Edit Resident</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input {...register('firstName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input {...register('lastName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input type="date" {...register('dateOfBirth')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select {...register('gender')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                  <input {...register('roomNumber')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                  <input type="date" {...register('admissionDate')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma-separated)</label>
                <input {...register('allergies')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">Emergency Contact</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Name</label>
                    <input {...register('emergencyContactName')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Phone</label>
                    <input {...register('emergencyContactPhone')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Relationship</label>
                    <input {...register('emergencyContactRelationship')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Resident?</h2>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to remove <strong>{resident.firstName} {resident.lastName}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentProfile;
