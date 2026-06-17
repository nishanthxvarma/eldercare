import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { HeartPulse, Utensils, FileText, Pill, ChevronDown, CheckCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

type TaskType = 'vitals' | 'meal' | 'note' | 'medication';

const CaretakerTasks = () => {
  const { user } = useAuth();
  const [activeTask, setActiveTask] = useState<TaskType>('vitals');
  const [selectedResident, setSelectedResident] = useState('');
  const queryClient = useQueryClient();

  const { data: residentsData } = useQuery({
    queryKey: ['caretaker-residents', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/residents?limit=100&caretakerId=${user?.id}`);
      return res.data.data?.residents || [];
    }
  });

  const { data: medications } = useQuery({
    queryKey: ['medications-for-resident', selectedResident],
    queryFn: async () => {
      const res = await apiClient.get(`/medications?residentId=${selectedResident}`);
      return res.data.data || [];
    },
    enabled: !!selectedResident && activeTask === 'medication'
  });

  // Vitals form
  const vitalsForm = useForm<any>();
  const vitalsMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedResident) throw new Error('Select a resident first');
      return apiClient.post('/health-records', {
        residentId: selectedResident,
        vitals: {
          bloodPressure: data.systolic && data.diastolic
            ? { systolic: Number(data.systolic), diastolic: Number(data.diastolic) }
            : undefined,
          heartRate: data.heartRate ? Number(data.heartRate) : undefined,
          temperature: data.temperature ? Number(data.temperature) : undefined,
          bloodSugar: data.bloodSugar ? Number(data.bloodSugar) : undefined,
          oxygenLevel: data.oxygenLevel ? Number(data.oxygenLevel) : undefined,
        },
        notes: data.notes,
        recordedAt: new Date().toISOString(),
        source: 'MANUAL',
      });
    },
    onSuccess: () => {
      toast.success('Vitals logged successfully!');
      vitalsForm.reset();
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err.message || 'Failed')
  });

  // Meal form
  const mealForm = useForm<any>();
  const mealMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedResident) throw new Error('Select a resident first');
      return apiClient.post('/care-logs', {
        residentId: selectedResident,
        type: 'MEAL',
        description: `Breakfast: ${data.breakfast || '—'}, Lunch: ${data.lunch || '—'}, Dinner: ${data.dinner || '—'}. Notes: ${data.notes || 'None'}`,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Meal log saved!');
      mealForm.reset();
      queryClient.invalidateQueries({ queryKey: ['care-logs'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err.message || 'Failed')
  });

  // Care notes form
  const noteForm = useForm<any>();
  const noteMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedResident) throw new Error('Select a resident first');
      return apiClient.post('/care-logs', {
        residentId: selectedResident,
        type: data.type || 'OTHER',
        description: data.description,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Care note saved!');
      noteForm.reset();
      queryClient.invalidateQueries({ queryKey: ['care-logs'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err.message || 'Failed')
  });

  // Medication administration form
  const medForm = useForm<any>();
  const medMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedResident) throw new Error('Select a resident first');
      if (!data.medicationId) throw new Error('Select a medication');
      return apiClient.post(`/medications/${data.medicationId}/log`, {
        status: data.status,
        administeredAt: new Date().toISOString(),
        notes: data.notes,
      });
    },
    onSuccess: () => {
      toast.success('Medication administration logged!');
      medForm.reset();
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err.message || 'Failed')
  });

  const tasks: { key: TaskType; label: string; icon: any; color: string }[] = [
    { key: 'vitals', label: 'Log Vitals', icon: HeartPulse, color: 'red' },
    { key: 'meal', label: 'Log Meals', icon: Utensils, color: 'amber' },
    { key: 'note', label: 'Care Notes', icon: FileText, color: 'blue' },
    { key: 'medication', label: 'Medication Admin', icon: Pill, color: 'indigo' },
  ];

  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Caretaker Tasks</h1>
        <p className="text-sm text-slate-500 mt-0.5">Log vitals, meals, care notes, and medication administration</p>
      </div>

      {/* Resident Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Select Resident:</label>
        <div className="relative flex-1 max-w-sm">
          <select
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— Choose a resident —</option>
            {residentsData?.map((r: any) => (
              <option key={r._id} value={r._id}>{r.firstName} {r.lastName} (Room {r.roomNumber})</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {selectedResident && (
          <button onClick={() => setSelectedResident('')} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task Type Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tasks.map(task => (
          <button
            key={task.key}
            onClick={() => setActiveTask(task.key)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${activeTask === task.key ? `${colorMap[task.color]} border-current` : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}`}
          >
            <task.icon className="w-5 h-5 mb-2" />
            <p className="font-medium text-sm">{task.label}</p>
          </button>
        ))}
      </div>

      {/* Forms */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {!selectedResident && (
          <div className="text-center py-8 text-slate-500">
            <ChevronDown className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>Select a resident above to start logging.</p>
          </div>
        )}

        {selectedResident && activeTask === 'vitals' && (
          <form onSubmit={vitalsForm.handleSubmit((d) => vitalsMutation.mutate(d))} className="space-y-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-500" /> Log Vitals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">BP Systolic (mmHg)</label>
                <input type="number" {...vitalsForm.register('systolic')} placeholder="120" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">BP Diastolic (mmHg)</label>
                <input type="number" {...vitalsForm.register('diastolic')} placeholder="80" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Heart Rate (bpm)</label>
                <input type="number" {...vitalsForm.register('heartRate')} placeholder="72" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temperature (°F)</label>
                <input type="number" step="0.1" {...vitalsForm.register('temperature')} placeholder="98.6" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Sugar (mg/dL)</label>
                <input type="number" {...vitalsForm.register('bloodSugar')} placeholder="90" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Oxygen Level (%)</label>
                <input type="number" {...vitalsForm.register('oxygenLevel')} placeholder="98" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea {...vitalsForm.register('notes')} rows={2} placeholder="Any observations..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <button type="submit" disabled={vitalsMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              <CheckCircle className="w-4 h-4" />
              {vitalsMutation.isPending ? 'Saving...' : 'Save Vitals'}
            </button>
          </form>
        )}

        {selectedResident && activeTask === 'meal' && (
          <form onSubmit={mealForm.handleSubmit((d) => mealMutation.mutate(d))} className="space-y-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" /> Log Meals
            </h2>
            <div className="space-y-4">
              {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                <div key={meal}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{meal}</label>
                  <input {...mealForm.register(meal)} placeholder={`Describe ${meal}...`} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                <textarea {...mealForm.register('notes')} rows={2} placeholder="Appetite, special notes..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            <button type="submit" disabled={mealMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50">
              <CheckCircle className="w-4 h-4" />
              {mealMutation.isPending ? 'Saving...' : 'Save Meal Log'}
            </button>
          </form>
        )}

        {selectedResident && activeTask === 'note' && (
          <form onSubmit={noteForm.handleSubmit((d) => noteMutation.mutate(d))} className="space-y-5">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Care Notes
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note Type</label>
              <select {...noteForm.register('type')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="OTHER">General Observation</option>
                <option value="MOOD">Mood Note</option>
                <option value="HYGIENE">Hygiene</option>
                <option value="ACTIVITY">Activity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea {...noteForm.register('description', { required: true })} rows={4} placeholder="Describe your observation..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={noteMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <CheckCircle className="w-4 h-4" />
              {noteMutation.isPending ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        )}

        {selectedResident && activeTask === 'medication' && (
          <div className="space-y-6">
            <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/50 space-y-3">
              <h3 className="font-semibold text-indigo-900 text-sm flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-indigo-600" /> Scheduled Medications & Timings
              </h3>
              {medications && medications.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {medications.map((med: any) => (
                    <div key={med._id} className="p-3 bg-white rounded-lg border border-slate-100 flex justify-between items-center text-xs shadow-sm">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{med.name} <span className="font-normal text-slate-500">({med.dosage})</span></p>
                        <p className="text-slate-500 mt-0.5">Timing: <span className="font-medium text-slate-700">{med.frequency?.replace('_', ' ')}</span></p>
                        {med.instructions && <p className="text-indigo-600 font-medium italic mt-0.5">"{med.instructions}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400">Prescribed by:</p>
                        <p className="font-semibold text-slate-700">{med.prescribedBy || 'Dr. Eleanor Smith'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active medications scheduled for this resident.</p>
              )}
            </div>

            <form onSubmit={medForm.handleSubmit((d) => medMutation.mutate(d))} className="space-y-5">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-500" /> Log Medication Administration
              </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medication *</label>
              <select {...medForm.register('medicationId', { required: true })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select medication</option>
                {medications?.map((med: any) => (
                  <option key={med._id} value={med._id}>{med.name} — {med.dosage}</option>
                ))}
              </select>
              {medications?.length === 0 && <p className="text-xs text-slate-500 mt-1">No medications assigned to this resident.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <div className="flex gap-3">
                {(['ADMINISTERED', 'MISSED', 'REFUSED'] as const).map(status => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={status} {...medForm.register('status', { required: true })} className="text-indigo-600" />
                    <span className="text-sm text-slate-700">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea {...medForm.register('notes')} rows={2} placeholder="Any notes about administration..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" disabled={medMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              <CheckCircle className="w-4 h-4" />
              {medMutation.isPending ? 'Saving...' : 'Log Administration'}
            </button>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};

export default CaretakerTasks;
