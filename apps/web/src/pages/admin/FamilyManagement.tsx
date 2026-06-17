import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Heart, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const FamilyManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: familyUsers, isLoading } = useQuery({
    queryKey: ['users', 'FAMILY'],
    queryFn: async () => {
      const res = await apiClient.get('/users?role=FAMILY');
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
      const payload = {
        ...form,
        role: 'FAMILY',
        familyRelations: form.residentId ? [{ residentId: form.residentId, relationshipType: form.relationshipType || 'Family' }] : [],
      };
      if (editUser) {
        return apiClient.patch(`/users/${editUser._id}`, payload);
      }
      return apiClient.post('/users', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(editUser ? 'Family member updated!' : 'Family member created!');
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
      toast.success('Family member removed');
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed')
  });

  const openEdit = (user: any) => {
    setEditUser(user);
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      residentId: user.familyRelations?.[0]?.residentId?._id || user.familyRelations?.[0]?.residentId || '',
      relationshipType: user.familyRelations?.[0]?.relationshipType || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg"><Heart className="w-5 h-5 text-rose-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Family Management</h1>
            <p className="text-sm text-slate-500">{familyUsers?.length ?? 0} family members registered</p>
          </div>
        </div>
        <button onClick={() => { setEditUser(null); reset({}); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Family Member
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Linked Resident</th>
                <th className="px-6 py-3">Relationship</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {familyUsers?.map((f: any) => (
                <tr key={f._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-700 font-semibold text-xs">
                        {f.firstName[0]}{f.lastName[0]}
                      </div>
                      {f.firstName} {f.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{f.email}</td>
                  <td className="px-6 py-4 text-slate-600">{f.phone}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {f.familyRelations?.[0]?.residentId
                      ? `${f.familyRelations[0].residentId.firstName} ${f.familyRelations[0].residentId.lastName}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {f.familyRelations?.[0]?.relationshipType || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(f)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!familyUsers || familyUsers.length === 0) && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No family members registered.</td></tr>
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
              <h2 className="text-lg font-bold text-slate-900">{editUser ? 'Edit Family Member' : 'Add Family Member'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input {...register('firstName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input {...register('lastName', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input type="email" {...register('email', { required: !editUser })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input {...register('phone', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                {!editUser && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                    <input type="password" {...register('password', { required: !editUser, minLength: 6 })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Linked Resident</label>
                  <select {...register('residentId')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                    <option value="">Select resident</option>
                    {residents?.map((r: any) => (
                      <option key={r._id} value={r._id}>{r.firstName} {r.lastName} (Room {r.roomNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                  <input {...register('relationshipType')} placeholder="e.g. Son, Daughter" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50">
                  {saveMutation.isPending ? 'Saving...' : editUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Remove Family Member?</h2>
            <p className="text-slate-600 text-sm mb-6">Remove <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong> from the system?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;
