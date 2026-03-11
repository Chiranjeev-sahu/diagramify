import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { ShineBorder } from '@/components/ui/ShineBorder';
import ShimmerButton from '@/components/ui/ShimmerButton';
import DiagramCarousel from '@/components/features/diagram/DiagramCarousel';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/useAuthStore';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let success = false;
    if (isLogin) {
      success = await login(formData.email, formData.password);
    } else {
      success = await register(formData.email, formData.password, formData.username);
    }

    if (success) {
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] font-sans text-slate-900 overflow-hidden relative p-4 lg:p-12">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 grid-background opacity-20 z-0"></div>
      
      {/* Subtle Gradient Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4 mb-10 group">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 transition-all duration-500">
            <img src="/logo.svg" alt="Logo" className="w-9 h-9" />
          </div>
          <div className="text-center">
            <h1 className="font-instrument-serif text-3xl font-semibold tracking-tight text-[#0f172a]">Diagramify</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Design your vision</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-slate-200/60 p-8 lg:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-[#0f172a] mb-2 font-instrument-serif tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {isLogin
                ? 'Sign in to continue your journey'
                : 'Join the community of visual thinkers'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/40 mb-8 relative shadow-inner">
            <div
              className={cn(
                "absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm border border-slate-200/50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isLogin ? "left-1" : "left-[calc(50%)]"
              )}
            />
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 text-sm font-bold relative z-10 transition-colors duration-300",
                isLogin ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 text-sm font-bold relative z-10 transition-colors duration-300",
                !isLogin ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Form Section */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className={cn(
              "space-y-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
              isLogin ? "max-h-[140px]" : "max-h-[220px]"
            )}>

              {/* Name Input (Signup Only) */}
              {!isLogin && (
                <div className="relative group animate-in fade-in slide-in-from-top-2 duration-500">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all duration-300 shadow-sm"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Forgot Password (Login Only) */}
            {isLogin && (
              <div className="flex justify-end pt-1">
                <button type="button" className="text-[11px] text-slate-400 hover:text-slate-900 transition-colors font-bold uppercase tracking-wider">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1e293b] text-white rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-blue-950/20 hover:bg-[#0f172a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 group border border-white/5"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-10">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            By continuing, you agree to our{' '}
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Terms</a>
            {' '}&{' '}
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;