import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'CARETAKER') navigate('/caretaker/dashboard', { replace: true });
      else if (user.role === 'FAMILY') navigate('/family/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'CARETAKER' | 'FAMILY'>('ADMIN');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    // Set default credentials on mount
    setValue('email', 'admin@test.com');
    setValue('password', 'password123');
  }, [setValue]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('Logged in successfully');
      navigate('/'); // AuthContext will handle role-based redirection
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getTestCredentials = () => {
    if (selectedRole === 'ADMIN') return 'admin@test.com / password123';
    if (selectedRole === 'CARETAKER') return 'caretaker1@test.com / password123';
    return 'family1@test.com / password123';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <HeartPulse size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">ElderCare Connect</h2>
          <p className="mt-2 text-sm text-slate-500 mb-6">Sign in to your account</p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['ADMIN', 'CARETAKER', 'FAMILY'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                if (role === 'ADMIN') {
                  setValue('email', 'admin@test.com');
                  setValue('password', 'password123');
                } else if (role === 'CARETAKER') {
                  setValue('email', 'caretaker1@test.com');
                  setValue('password', 'password123');
                } else if (role === 'FAMILY') {
                  setValue('email', 'family1@test.com');
                  setValue('password', 'password123');
                }
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                selectedRole === role
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <form className="mt-4 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                {...register('email')}
                id="email"
                type="email"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                {...register('password')}
                id="password"
                type="password"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-slate-500 font-medium text-xs">For testing {selectedRole.toLowerCase()} use:</p>
            <p className="text-xs font-mono text-slate-600 mt-1 select-all">{getTestCredentials()}</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
