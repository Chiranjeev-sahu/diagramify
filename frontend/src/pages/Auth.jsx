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
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">

      {/* Left Side - Diagram Carousel (Desktop Only) */}
      <div className="hidden md:flex w-1/2 h-screen">
        <DiagramCarousel />
      </div>

      {/* Vertical Divider with Custom Pattern (Desktop Only) */}
      <div className="hidden md:block w-5 h-screen bg-[repeating-linear-gradient(-45deg,#e6e6e6_0,#e6e6e6_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed border-x border-slate-200/60 z-20"></div>

      {/* Right Side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-[#fefcf9] relative">
        {/* Mobile Background Blobs */}
        <div className="md:hidden absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-100/50 blur-[80px]" />
          <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[80px]" />
        </div>

        <div className="w-full max-w-md z-10">
          <ShineBorder
            className="w-full bg-white dark:bg-white backdrop-blur-xl border border-slate-200 p-0 overflow-hidden shadow-xl shadow-slate-200/40"
            color={["#1a1cfe", "#0001f7", "#5924ef"]}
            borderRadius={10}
          >
            <div className="p-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h1>
                <p className="text-slate-500 text-sm">
                  {isLogin
                    ? 'Enter your credentials to access your workspace'
                    : 'Create an account to start diagramming'}
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 mb-8 relative">
                <div
                  className={cn(
                    "absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-slate-200/50 transition-all duration-200 ease-out",
                    isLogin ? "left-1" : "left-[calc(50%)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium relative z-10 transition-colors duration-200",
                    isLogin ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium relative z-10 transition-colors duration-200",
                    !isLogin ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Sign Up
                </button>
              </div>

              {/* Form Section */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className={cn(
                  "space-y-4 transition-all duration-300 ease-in-out overflow-hidden p-1",
                  isLogin ? "h-[185px]" : "h-[265px]"
                )}>

                  {/* Name Input (Signup Only) */}
                  <div className={cn(
                    "transition-all duration-300 ease-in-out origin-top",
                    isLogin
                      ? "opacity-0 -translate-y-4 scale-95 h-0 overflow-hidden mb-0"
                      : "opacity-100 translate-y-0 scale-100 h-auto mb-4"
                  )}>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full bg-white border border-slate-200 rounded-xl px-10 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-200 focus:ring-1 focus:ring-purple-200 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-10 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-200 focus:ring-1 focus:ring-purple-200 transition-all shadow-sm"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-10 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-200 focus:ring-1 focus:ring-purple-200 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Forgot Password (Login Only) */}
                <div className={cn(
                  "flex justify-end transition-all duration-300",
                  isLogin ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
                )}>
                  <a href="#" className="text-xs text-slate-500 hover:text-purple-600 transition-colors font-medium">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <ShimmerButton
                  type="submit"
                  className="w-full mt-6 shadow-lg shadow-slate-900/20"
                  background="rgba(0, 0, 0, 1)"
                  shimmerColor="#ffffff"
                  disabled={isLoading}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </span>
                </ShimmerButton>
              </form>
            </div>
          </ShineBorder>

          {/* Footer Note */}
          <p className="text-center mt-8 text-slate-400 text-sm">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600 transition-colors">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;