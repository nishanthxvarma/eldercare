import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Users, Plus, Pencil, Trash2, X, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const CaretakerManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: caretakers, isLoading } = useQuery({
    queryKey: ['users', 'CARETAKER'],
    queryFn: async () => {
      const res = await apiClient.get('/users?role=CARETAKER');
      return res.data.data;
    }
  });

  const { data: residents } = useQuery({
    queryKey: ['residents-simple'],
    queryFn: async () => {
      const res = await apiClient.get('/residents?limit=100');
      return res.data.data?.residents || [];
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  const saveMutation = useMutation({
    mutationFn: async (form: any) => {
      if (editUser) {
        return apiClient.patch(`/users/${editUser._id}`, { ...form, role: 'CARETAKER' });
      }
      return apiClient.post('/users', { ...form, role: 'CARETAKER' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(editUser ? 'Caretaker updated!' : 'Caretaker created!');
      setShowModal(false);
      setEditUser(null);
      reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to save')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Caretaker deactivated');
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to deactivate')
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, residentIds }: { id: string; residentIds: string[] }) =>
      apiClient.patch(`/users/${id}/assign-residents`, { residentIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Residents assigned!');
      setAssignTarget(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to assign')
  });

  const openEdit = (caretaker: any) => {
    setEditUser(caretaker);
    reset({
      firstName: caretaker.firstName,
      lastName: caretaker.lastName,
      email: caretaker.email,
      phone: caretaker.phone,
      shift: caretaker.shift || '',
      employeeId: caretaker.employeeId || '',
    });
    setShowModal(true);
  };

  const openAssign = (caretaker: any) => {
    setAssignTarget(caretaker);
    setSelectedResidents(
      caretaker.assignedResidents?.map((r: any) => typeof r === 'string' ? r : r._id) || []
    );
  };

  const toggleResident = (id: string) => {
    setSelectedResidents(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg"><Users className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Caretaker Management</h1>
            <p className="text-sm text-slate-500">{caretakers?.length ?? 0} caretakers</p>
          </div>
        </div>
        <button onClick={() => { setEditUser(null); reset({}); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Caretaker
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading caretakers...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Shift</th>
                <th className="px-6 py-3">Assigned Residents</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {caretakers?.map((c: any) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-xs">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      {c.firstName} {c.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.email}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.shift ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {c.shift.toLowerCase()}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {c.assignedResidents?.length || 0} residents
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openAssign(c)} title="Assign Residents" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!caretakers || caretakers.length === 0) && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No caretakers found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editUser ? 'Edit Caretaker' : 'Add Caretaker'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input {...register('firstName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input {...register('lastName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input type="email" {...register('email', { required: !editUser })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input {...register('phone', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                {!editUser && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                    <input type="password" {...register('password', { required: !editUser, minLength: 6 })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shift</label>
                  <select {...register('shift')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select shift</option>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                  <input {...register('employeeId')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  {saveMutation.isPending ? 'Saving...' : editUser ? 'Update' : 'Create Caretaker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Residents Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assign Residents</h2>
                <p className="text-sm text-slate-500">To {assignTarget.firstName} {assignTarget.lastName}</p>
              </div>
              <button onClick={() => setAssignTarget(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {residents?.map((r: any) => (
                <label key={r._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedResidents.includes(r._id) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={selectedResidents.includes(r._id)} onChange={() => toggleResident(r._id)} className="rounded border-slate-300 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{r.firstName} {r.lastName}</p>
                    <p className="text-xs text-slate-500">Room {r.roomNumber}</p>
                  </div>
                </label>
              ))}
              {(!residents || residents.length === 0) && (
                <p className="text-center text-slate-500 text-sm py-8">No residents available.</p>
              )}
            </div>
            <div className="p-6 border-t flex justify-between items-center">
              <span className="text-sm text-slate-500">{selectedResidents.length} selected</span>
              <div className="flex gap-3">
                <button onClick={() => setAssignTarget(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button
                  onClick={() => assignMutation.mutate({ id: assignTarget._id, residentIds: selectedResidents })}
                  disabled={assignMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {assignMutation.isPending ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Deactivate Caretaker?</h2>
            <p className="text-slate-600 text-sm mb-6">Deactivate <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? They will lose access to the system.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerManagement;
