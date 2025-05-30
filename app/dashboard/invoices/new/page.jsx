'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/InvoiceForm';
import { generateInvoiceNumber, createInvoice } from '@/app/actions/invoice';
import { getClients} from '@/app/actions/client';


export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch clients using server action
        const { clients, error: clientsError } = await getClients();
        
        if (clientsError) {
          throw new Error(clientsError);
        }
        
        setClients(clients || []);
        
        // Generate invoice number using server action
        const { invoiceNumber, error: invoiceNumberError } = await generateInvoiceNumber();
        
        if (invoiceNumberError) {
          throw new Error(invoiceNumberError);
        }
        
        // Set initial data for the form
        setInitialData({
          client_id: '',
          invoice_number: invoiceNumber || `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: '',
          status: 'DRAFT',
          items: [
            {
              description: '',
              quantity: 1,
              price: 0, // changed from unit_price to price for consistency
              amount: 0,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a FormData object to pass to the server action
      const data = new FormData();
      
      // Add invoice details
      data.append('client_id', formData.client_id);
      data.append('invoice_number', formData.invoice_number);
      data.append('issue_date', formData.issue_date);
      data.append('due_date', formData.due_date);
      data.append('status', formData.status);
      data.append('notes', formData.notes || '');
      data.append('subtotal', formData.subtotal || 0);
      data.append('tax_rate', formData.tax_rate || 0);
      data.append('tax_amount', formData.tax_amount || 0);
      data.append('discount', formData.discount || 0);
      data.append('total', formData.total || 0);
      
      // Ensure all items use 'price' instead of 'unit_price'
      const items = (formData.items || []).map(item => ({
        ...item,
        price: item.price ?? item.unit_price ?? 0,
        unit_price: undefined // remove unit_price if present
      }));
      data.append('items', JSON.stringify(items));

      // Call the server action to create the invoice
      const result = await createInvoice(data);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Success! The server action will handle the redirect
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-4 border-t-green-400 border-b-green-400 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">New Invoice</h1>
        <div className="bg-indigo-800/30 backdrop-blur-md border-l-4 border-green-400 p-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-base text-white">
                You need to add at least one client before creating an invoice.
              </p>
              <p className="mt-4">
                <button
                  onClick={() => router.push('/dashboard/clients')}
                  className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                  Add a Client →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">New Invoice</h1>
      
      {error && (
        <div className="bg-red-900/30 backdrop-blur-md border-l-4 border-red-500 p-4 rounded-lg mb-6">
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
      
      {initialData && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <InvoiceForm
            clients={clients}
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}