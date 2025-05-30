'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getClients, addClient, updateClient, deleteClient } from '@/app/actions/client';
import { colors, tailwindClasses } from '@/utils/colors';
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

// Generate a list of country codes and their names
const countryOptions = getCountries().map(countryCode => {
  try {
    const callingCode = getCountryCallingCode(countryCode);
    return {
      code: `+${callingCode}`,
      name: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode),
      iso: countryCode,
    };
  } catch (error) {
    // Some country codes might not have a direct calling code or display name
    return null;
  }
}).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').refine((value) => {
    // Validate phone number using libphonenumber-js
    const countryCode = document.querySelector('[name="country_code"]')?.value;
    if (!countryCode) return false; // Should not happen if select is populated correctly
    try {
      return isValidPhoneNumber(value, { defaultCallingCode: countryCode.replace('+', '') });
    } catch (e) {
      return false;
    }
  }, {
    message: 'Invalid phone number for the selected country',
  }),
  address: z.string().optional(),
  notes: z.string().optional(),
  country_code: z.string().default('+1'),
});

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      country_code: '+1',
    },
  });

  // Watch country code value
  const country_code = watch('country_code');

  // Fetch clients on component mount
  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      try {
        const { clients: fetchedClients, error } = await getClients();
        
        if (error) {
          throw new Error(error);
        }
        
        setClients(fetchedClients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClients();
  }, []);

  // Set form values when editing a client
  useEffect(() => {
    if (editingClient) {
      setValue('name', editingClient.name);
      setValue('email', editingClient.email);
      
      const whatsappNumber = editingClient.whatsapp_number || '';
      try {
        const phoneNumber = parsePhoneNumber(whatsappNumber);
        setValue('country_code', `+${phoneNumber.countryCallingCode}`);
        setValue('phone', phoneNumber.nationalNumber);
      } catch (e) {
        // If parsing fails, default to +1 and the full number
        setValue('country_code', '+1');
        setValue('phone', whatsappNumber);
      }
      
      setValue('address', editingClient.address || '');
      setValue('notes', editingClient.notes || '');
    }
  }, [editingClient, setValue]);

  const handleCreateClient = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      
      // Format phone number to E.164 before sending
      let formattedPhoneNumber = '';
      try {
        const phoneNumber = parsePhoneNumber(data.phone, { defaultCallingCode: data.country_code.replace('+', '') });
        formattedPhoneNumber = phoneNumber.format('E.164');
      } catch (e) {
        // Fallback if parsing fails, though Zod validation should prevent this
        formattedPhoneNumber = `${data.country_code}${data.phone}`;
      }
      formData.append('whatsapp_number', formattedPhoneNumber);
      
      formData.append('address', data.address || '');
      formData.append('notes', data.notes || '');
      
      // Call server action
      const result = await addClient(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh clients list
      const { clients: updatedClients } = await getClients();
      setClients(updatedClients || []);
      
      // Close modal and reset form
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      
      // Format phone number to E.164 before sending
      let formattedPhoneNumber = '';
      try {
        const phoneNumber = parsePhoneNumber(data.phone, { defaultCallingCode: data.country_code.replace('+', '') });
        formattedPhoneNumber = phoneNumber.format('E.164');
      } catch (e) {
        // Fallback if parsing fails, though Zod validation should prevent this
        formattedPhoneNumber = `${data.country_code}${data.phone}`;
      }
      formData.append('whatsapp_number', formattedPhoneNumber);
      
      formData.append('address', data.address || '');
      formData.append('notes', data.notes || '');
      
      // Call server action
      const result = await updateClient(editingClient.id, formData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh clients list
      const { clients: updatedClients } = await getClients();
      setClients(updatedClients || []);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setEditingClient(null);
      reset();
    } catch (error) {
      console.error('Error updating client:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }
    
    try {
      // Call server action
      const result = await deleteClient(id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh clients list
      const { clients: updatedClients } = await getClients();
      setClients(updatedClients || []);
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error.message);
    }
  };

  const onSubmit = (data) => {
    if (editingClient) {
      handleUpdateClient(data);
    } else {
      handleCreateClient(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-4 border-t-green-400 border-b-green-400 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <button
          onClick={() => {
            setEditingClient(null);
            reset();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Add New Client
        </button>
      </div>

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

      {/* Client List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {clients?.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-white">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{client.whatsapp_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{client.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setIsModalOpen(true);
                        }}
                        className="text-green-400 hover:text-green-300 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!clients || clients.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-indigo-800/50 rounded-lg inline-block mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="mb-4">No clients found. Add your first client!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 ">
          <div className="bg-indigo-950/90 rounded-xl border border-white/20 p-6 max-w-md w-full shadow-xl mt-[400px]">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

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
                <label className="block text-sm font-medium text-gray-200 mb-1">Phone Number</label>
                <div className="flex space-x-2">
                  <select
                    {...register('country_code')}
                    className="bg-indigo-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400 w-1/4"
                  >
                    {countryOptions.map((country) => (
                      <option key={country.iso} value={country.code}>
                        {country.code} ({country.name})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="123456789"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Address</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                    reset();
                  }}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full animate-spin mr-2"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>{editingClient ? 'Update' : 'Add'} Client</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
