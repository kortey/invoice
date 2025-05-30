'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import InvoicePDF from '@/components/InvoicePDF';
import { getClientById } from '@/app/actions/client';
import { getInvoiceById, sendInvoiceViaWhatsApp as sendInvoiceServerAction } from '@/app/actions/invoice';
import { getProfile } from '@/app/actions/profile';

// Defensive date parsing utility
function parseDate(dateValue) {
  if (!dateValue) return '';
  // If it's a string or number, try to parse directly
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const d = new Date(dateValue);
    return isNaN(d) ? '' : d.toLocaleDateString();
  }
  // If it's a plain object, try to extract ISO/date string from known keys
  if (typeof dateValue === 'object' && dateValue !== null) {
    // Prisma/Next.js can sometimes return { value: '2024-05-17T00:00:00.000Z' }
    for (const key of ['value', 'date', 'iso', 'raw', 'string']) {
      if (dateValue[key] && typeof dateValue[key] === 'string') {
        const d = new Date(dateValue[key]);
        if (!isNaN(d)) return d.toLocaleDateString();
      }
    }
    // If object has toString that returns a date string
    if (typeof dateValue.toString === 'function') {
      const str = dateValue.toString();
      const d = new Date(str);
      if (!isNaN(d)) return d.toLocaleDateString();
    }
    // If object has toISOString
    if (typeof dateValue.toISOString === 'function') {
      const d = new Date(dateValue.toISOString());
      if (!isNaN(d)) return d.toLocaleDateString();
    }
  }
  return '';
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [client, setClient] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappLoading, setWhatsappLoading] = useState(false); // Separate loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const invoiceRes = await getInvoiceById(invoiceId);
        if (invoiceRes?.error) throw new Error(invoiceRes.error);
        if (!cancelled) {
          setInvoice(invoiceRes.invoice);
          setItems(invoiceRes.invoice?.items || []);
        }
        if (invoiceRes.invoice?.client_id) {
          const clientRes = await getClientById(invoiceRes.invoice.client_id);
          if (clientRes?.error) throw new Error(clientRes.error);
          if (!cancelled) setClient(clientRes.client || clientRes);
        }
        console.log(invoiceRes.invoice);
        const profileRes = await getProfile();
        if (profileRes?.error) throw new Error(profileRes.error);
        if (!cancelled) setProfile(profileRes.profile || profileRes);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load invoice details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (invoiceId) fetchData();
    return () => { cancelled = true; };
  }, [invoiceId]);

  console.log(invoice)
  
  const handleSendViaWhatsApp = async (event) => {
    event.preventDefault();
    if (!invoiceId) {
      console.error('Invoice ID is missing.');
      setError('Invoice ID is missing.');
      return;
    }
    
    setWhatsappLoading(true);
    setError(null);
    
    try {
      console.log('Calling sendInvoiceServerAction...');
      // Fixed: Properly destructure the response including 'success'
      const result = await sendInvoiceServerAction(invoiceId);
      console.log('Server action response:', result);

      if (result.success && result.whatsappLink) {
        console.log('Opening WhatsApp link:', result.whatsappLink);
        window.open(result.whatsappLink, '_blank');
        // Optional: Show success message
        // You could add a success state here if needed
      } else if (result.error) {
        setError(result.error);
        console.error('Error sending WhatsApp:', result.error);
      } else {
        console.warn('Unexpected response from server action:', result);
        setError('Failed to get WhatsApp link from server.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp message');
      console.error('Caught error in handleSendViaWhatsApp:', err);
    } finally {
      console.log('Finished handleSendViaWhatsApp.');
      setWhatsappLoading(false);
    }
  };

  if (loading) {
    return <div>Loading invoice details...</div>;
  }

  if (error && !invoice) {
    return <div>Error: {error}</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <div className="p-6">
      {/* Show error message if there's an error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
        <div className="space-x-4">
          <button
            onClick={() => router.push(`/dashboard/invoices/${invoiceId}/edit`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Edit Invoice
          </button>
          <button
            type="button"
            onClick={handleSendViaWhatsApp}
            disabled={whatsappLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {whatsappLoading ? 'Sending...' : 'Send via WhatsApp'}
          </button>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            {
              'DRAFT': 'bg-gray-100 text-gray-800',
              'SENT': 'bg-blue-100 text-blue-800',
              'PAID': 'bg-green-100 text-green-800',
              'OVERDUE': 'bg-red-100 text-red-800',
            }[invoice.status]
          }`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Invoice Details</h2>
            <p><strong>Issue Date:</strong> {parseDate(invoice.issue_date)}</p>
            <p><strong>Due Date:</strong> {parseDate(invoice.due_date)}</p>
            {invoice.notes && (
              <p className="mt-2">
                <strong>Notes:</strong><br />
                {invoice.notes}
              </p>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Client Details</h2>
            <p><strong>Name:</strong> {client?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {client?.email || 'N/A'}</p>
            <p><strong>WhatsApp:</strong> {client?.whatsapp_number || 'N/A'}</p>
            <p><strong>Address:</strong> {client?.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Only show preview if we have all required data */}
      {client && profile && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <InvoicePDF
              invoice={invoice}
              client={client}
              profile={profile}
              items={items}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <div className="space-x-4">
          {invoice.status === 'SENT' && (
            <button
              onClick={() => setInvoice({ ...invoice, status: 'PAID' })}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Mark as Paid
            </button>
          )}
          {invoice.status === 'PAID' && (
            <button
              onClick={() => setInvoice({ ...invoice, status: 'SENT' })}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              Mark as Unpaid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}