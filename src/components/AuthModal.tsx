import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  X,
  Mail,
  User as UserIcon,
  Phone,
  CheckCircle2,
  Circle,
  CheckCircle } from
'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ADMIN_EMAIL } from '../firebase/services';
import { registerUser, loginUser } from '../firebase/services';
type Step = 'details' | 'success';
type AuthMode = 'register' | 'login';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Common disposable/throwaway domains we treat as "fake"
const DISPOSABLE_DOMAINS = [
'mailinator.com',
'tempmail.com',
'temp-mail.org',
'10minutemail.com',
'guerrillamail.com',
'trashmail.com',
'yopmail.com',
'sharklasers.com',
'fakeinbox.com',
'throwawaymail.com'];

export function AuthModal({
  isOpen,
  onClose



}: {isOpen: boolean;onClose: () => void;}) {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState<{
    [k: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const reset = () => {
    setStep('details');
    setAuthMode('register');
    setForm({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  const validateDetails = () => {
    const next: {
      [k: string]: string;
    } = {};
    
    if (authMode === 'register' && !form.name.trim()) {
      next.name = 'Ilagay ang pangalan mo.';
    }
    
    const email = form.email.trim().toLowerCase();
    if (!email) {
      next.email = 'Kailangan ng email.';
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = 'Mukhang hindi tama ang email na ito.';
    } else if (DISPOSABLE_DOMAINS.includes(email.split('@')[1])) {
      next.email = 'Hindi tanggap ang temporary/fake email.';
    }
    
    if (authMode === 'register') {
      const phone = form.phone.replace(/[\s-]/g, '');
      if (!phone) {
        next.phone = 'Kailangan ng number.';
      } else if (!/^(\+?\d{7,15})$/.test(phone)) {
        next.phone = 'Mukhang hindi tama ang number na ito.';
      }
    }
    
    if (!form.password) {
      next.password = 'Kailangan ng password.';
    } else if (form.password.length < 6) {
      next.password = 'Password should be at least 6 characters.';
    }
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;
    
    setIsSubmitting(true);
    
    if (authMode === 'register') {
      // Register with Firebase Auth
      const authResult = await registerUser(form.email, form.password);
      
      if (authResult.success) {
        // Firebase Auth successful, now login with user details
        login('email', {
          name: form.name,
          email: form.email,
          phone: form.phone
        });
        setStep('success');
      } else {
        setErrors({
          ...errors,
          email: authResult.error || 'Registration failed. Please try again.'
        });
      }
    } else {
      // Login with Firebase Auth
      const authResult = await loginUser(form.email, form.password);
      
      if (authResult.success) {
        // Firebase Auth successful, the AppContext will handle setting the user
        setStep('success');
      } else {
        setErrors({
          ...errors,
          email: authResult.error || 'Login failed. Please check your credentials.'
        });
      }
    }
    
    setIsSubmitting(false);
  };
  const handleConfirm = () => {
    const message = authMode === 'register' 
      ? `Welcome, ${form.name}! Matagumpay kang nakarehistro.`
      : 'Welcome back! Matagumpay kang nakalog-in.';
    
    toast.success(message, {
      duration: 4000,
      icon: '🎉'
    });
    handleClose();
    
    // Redirect to admin view if the user is the admin
    if (form.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      navigate('/admin');
    }
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          onClick={handleClose} />
        
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto pointer-events-auto">
            
              {/* Wizard Progress Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6 mt-2">
                {[1, 2].map((num) => {
                  const isCompleted = (step === 'details' && num === 1) || 
                                   (step === 'success');
                  const isCurrent = (step === 'details' && num === 1) || 
                                   (step === 'success' && num === 2);
                  return (
                    <React.Fragment key={num}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        isCompleted ? 'border-green-500 bg-green-500 text-white' :
                        isCurrent ? 'border-primary-500 bg-primary-500 text-white' :
                        'border-stone-300 text-stone-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      {num < 2 && (
                        <div className={`h-0.5 w-8 transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-stone-300'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            
              <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full z-10">
              
                <X className="w-5 h-5" />
              </button>

              {step === 'details' &&
            <>
                  <div className="text-center mb-8 mt-4 px-6">
                    <h2 className="text-3xl font-display font-bold text-stone-900 mb-2">
                      {authMode === 'register' ? 'Sali na sa Boss Seth Kusina' : 'Log in sa Boss Seth Kusina'}
                    </h2>
                    <p className="text-stone-500">
                      {authMode === 'register' ? 'Ilagay ang detalye mo para makapag-rehistro.' : 'Ilagay ang email at password mo.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2"
                    >
                      {authMode === 'register' ? 'May account na? Log in na' : 'Wala pang account? Magrehistro'}
                    </button>
                  </div>

                  <form
                onSubmit={handleAuth}
                className="space-y-4"
                noValidate>
                
                    {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">
                        Pangalan
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
                      }
                      placeholder="hal., Juan Dela Cruz"
                      className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 pl-10 pr-4 outline-none transition-all" />
                    
                      </div>
                      {errors.name &&
                  <p className="text-sm text-red-500 mt-1">
                          {errors.name}
                        </p>
                  }
                    </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value
                      })
                      }
                      placeholder="hal., juan@gmail.com"
                      className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 pl-10 pr-4 outline-none transition-all" />
                    
                      </div>
                      {errors.email &&
                  <p className="text-sm text-red-500 mt-1">
                          {errors.email}
                        </p>
                  }
                    </div>

                    {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">
                        Numero
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value
                      })
                      }
                      placeholder="hal., 0917 123 4567"
                      className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 pl-10 pr-4 outline-none transition-all" />
                    
                      </div>
                      {errors.phone &&
                  <p className="text-sm text-red-500 mt-1">
                          {errors.phone}
                        </p>
                  }
                    </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">
                        Password
                      </label>
                      <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value
                      })
                      }
                    placeholder="Min. 6 characters"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all" />
                  
                      {errors.password &&
                  <p className="text-sm text-red-500 mt-1">
                          {errors.password}
                        </p>
                  }
                    </div>

                    <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-semibold hover:bg-stone-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  
                      {isSubmitting 
                        ? (authMode === 'register' ? 'Nagpaparehistro...' : 'Nagpapalog-in...')
                        : (authMode === 'register' ? 'Magrehistro' : 'Mag-log in')
                      }
                    </button>
                  </form>
                </>
            }


              {step === 'success' &&
            <div className="text-center py-6 px-4">
                  <motion.div
                initial={{
                  scale: 0.6,
                  opacity: 0
                }}
                animate={{
                  scale: 1,
                  opacity: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18
                }}
                className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                
                    <CheckCircle2 className="w-11 h-11" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">
                    {authMode === 'register' ? 'Welcome sa Boss Seth Kusina!' : 'Welcome back!'}
                  </h2>
                  <p className="text-stone-500 mb-2">
                    {authMode === 'register' ? 'Matagumpay kang nakarehistro.' : 'Matagumpay kang nakalog-in.'}
                  </p>
                  <p className="text-stone-700 font-semibold mb-8">
                    Welcome, {form.name || 'Chef'}!
                  </p>
                  <button
                onClick={handleConfirm}
                className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
                
                    Magpatuloy
                  </button>
                </div>
            }
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

}