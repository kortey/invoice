'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile, uploadProfileLogo } from '@/app/actions/profile';
import { colors, tailwindClasses } from '@/utils/colors';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  payment_details: z.object({
    bank_name: z.string().min(1, 'Bank name is required'),
    account_number: z.string().min(1, 'Account number is required'),
    routing_number: z.string().optional(),
  }),
});

export default function ProfilePage() {
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      company_name: '',
      email: '',
      phone: '',
      website: '',
      payment_details: {
        bank_name: '',
        account_number: '',
        routing_number: '',
      },
    }
  });

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const { profile, error } = await getProfile();
        if (error) throw new Error(error);
        setProfileData(profile);
        if (profile) {
          setValue('full_name', profile.full_name || '');
          setValue('company_name', profile.company_name || '');
          setValue('email', profile.email || '');
          setValue('phone', profile.phone || '');
          setValue('website', profile.website || '');
          setValue('payment_details.bank_name', profile.payment_details?.bank_name || '');
          setValue('payment_details.account_number', profile.payment_details?.account_number || '');
          setValue('payment_details.routing_number', profile.payment_details?.routing_number || '');
          if (profile.logo_url) setLogoPreview(profile.logo_url);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [setValue]);

  const handleProfileUpdate = async (data) => {
    setIsSaving(true);
    setError(null);
    try {
      // Call server action directly with plain object
      const result = await updateProfile(data);
      if (result.error) throw new Error(result.error);
      alert('Profile updated successfully!');
      const { profile } = await getProfile();
      setProfileData(profile);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);
      const result = await uploadProfileLogo(formData);
      if (result.error) throw new Error(result.error);
      alert('Logo uploaded successfully!');
      const { profile } = await getProfile();
      setProfileData(profile);
      setSelectedFile(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-4 border-t-green-400 border-b-green-400 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Business Profile</h1>
      
      {error && (
        <div className="bg-red-900/30 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo Upload Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 md:col-span-1">
          <h2 className="text-xl font-semibold text-white mb-4">Company Logo</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-40 h-40 bg-indigo-800/50 rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            
            <label className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg cursor-pointer transition">
              <span>Choose Logo</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
            
            {selectedFile && (
              <button
                onClick={handleLogoUpload}
                disabled={isUploading}
                className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full animate-spin mr-2"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Upload Logo'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Business Information</h2>
          
          <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('full_name')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Company Name</label>
                <input
                  type="text"
                  {...register('company_name')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.company_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Phone</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Website (optional)</label>
              <input
                type="text"
                {...register('website')}
                placeholder="https://example.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-400">{errors.website.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Bank Name</label>
                <input
                  type="text"
                  {...register('payment_details.bank_name')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.payment_details?.bank_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.payment_details.bank_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Account Number</label>
                <input
                  type="text"
                  {...register('payment_details.account_number')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.payment_details?.account_number && (
                  <p className="mt-1 text-sm text-red-400">{errors.payment_details.account_number.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Routing Number (optional)</label>
              <input
                type="text"
                {...register('payment_details.routing_number')}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {errors.payment_details?.routing_number && (
                <p className="mt-1 text-sm text-red-400">{errors.payment_details.routing_number.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}