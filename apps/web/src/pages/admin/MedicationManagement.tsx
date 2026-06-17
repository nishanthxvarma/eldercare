import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Pill, Search, Plus, Pencil, Trash2, X, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface MedicationForm {
  residentId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'ONCE_DAILY', label: 'Once Daily' },
  { value: 'TWICE_DAILY', label: 'Twice Daily' },
  { value: 'THREE_TIMES_DAILY', label: 'Three Times Daily' },
  { value: 'FOUR_TIMES_DAILY', label: 'Four Times Daily' },
  { value: 'AS_NEEDED', label: 'As Needed' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const MedicationManagement = () => {
  const [search, setSearch] = useState('');
  const [filterResident, setFilterResident] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications', search, filterResident],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterResident) params.set('residentId', filterResident);
      const res = await apiClient.get(`/medications?${params.toString()}`);
      return res.data.data;
    }
  });

  const { data: residents } = useQuery({
    queryKey: ['residents-list'],
    queryFn: async () => {
      const res = await apiClient.get('/residents?limit=100');
      return res.data.data?.residents || [];
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MedicationForm>();

  const saveMutation = useMutation({
    mutationFn: async (form: MedicationForm) => {
      if (editMed) {
        return apiClient.patch(`/medications/${editMed._id}`, form);
      }
      return apiClient.post('/medications', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success(editMed ? 'Medication updated!' : 'Medication added!');
      setShowModal(false);
      setEditMed(null);
      reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to save')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/medications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication deleted');
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete')
  });

  const openEdit = (med: any) => {
    setEditMed(med);
    reset({
      residentId: med.residentId?._id || med.residentId,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      instructions: med.instructions || '',
      prescribedBy: med.prescribedBy,
      startDate: med.startDate?.split('T')[0],
      endDate: med.endDate?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditMed(null);
    reset({});
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg"><Pill className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Medication Management</h1>
            <p className="text-sm text-slate-500">{medications?.length ?? 0} medications on record</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-48">
          <select
            value={filterResident}
            onChange={(e) => setFilterResident(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Residents</option>
            {residents?.map((r: any) => (
              <option key={r._id} value={r._id}>{r.firstName} {r.lastName}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {(search || filterResident) && (
          <button onClick={() => { setSearch(''); setFilterResident(''); }} className="text-sm text-slate-500 hover:text-slate-800 underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading medications...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Resident</th>
                <th className="p-4 font-semibold">Medicine</th>
                <th className="p-4 font-semibold">Dosage</th>
                <th className="p-4 font-semibold">Frequency</th>
                <th className="p-4 font-semibold">Prescribed By</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medications?.map((med: any) => (
                <tr key={med._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-700 font-medium">
                    {med.residentId ? `${med.residentId.firstName} ${med.residentId.lastName}` : '—'}
                    {med.residentId?.roomNumber && <span className="ml-1 text-xs text-slate-400">({med.residentId.roomNumber})</span>}
                  </td>
                  <td className="p-4 font-medium text-slate-900">{med.name}</td>
                  <td className="p-4 text-slate-600">{med.dosage}</td>
                  <td className="p-4 text-slate-600">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                      {med.frequency?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{med.prescribedBy}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${med.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {med.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(med)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(med)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!medications || medications.length === 0) && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p>No medications found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editMed ? 'Edit Medication' : 'Add Medication'}</h2>
              <button onClick={() => { setShowModal(false); setEditMed(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resident *</label>
                <select {...register('residentId', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select resident</option>
                  {residents?.map((r: any) => (
                    <option key={r._id} value={r._id}>{r.firstName} {r.lastName} (Room {r.roomNumber})</option>
                  ))}
                </select>
                {errors.residentId && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label>
                  <input {...register('name', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosage *</label>
                  <input {...register('dosage', { required: true })} placeholder="e.g. 500mg" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency *</label>
                  <select {...register('frequency', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select frequency</option>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prescribed By *</label>
                  <input {...register('prescribedBy', { required: true })} placeholder="Dr. Name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                  <input type="date" {...register('startDate', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" {...register('endDate')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
                <textarea {...register('instructions')} rows={2} placeholder="Take with food..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditMed(null); }} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saveMutation.isPending ? 'Saving...' : editMed ? 'Update' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Medication?</h2>
            <p className="text-slate-600 text-sm mb-6">
              Remove <strong>{deleteTarget.name}</strong> from the system?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationManagement;
