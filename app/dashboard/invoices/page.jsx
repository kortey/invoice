'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getInvoices, deleteInvoice } from "../../actions/invoice";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchInvoices() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setInvoices([]);
          return;
        }
        const response = await getInvoices();
        if (response?.error) throw new Error(response.error);
        if (!cancelled) setInvoices(response.invoices || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch invoices');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInvoices();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="p-6">Loading invoices...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Invoice
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {invoices && invoices.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.client?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      {
                        'DRAFT': 'bg-gray-100 text-gray-800',
                        'SENT': 'bg-blue-100 text-blue-800',
                        'PAID': 'bg-green-100 text-green-800',
                        'OVERDUE': 'bg-red-100 text-red-800',
                      }[invoice.status]
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/invoices/${invoice.id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No invoices found. Create your first invoice!
          </div>
        )}
      </div>
    </div>
  );

  async function handleDelete(invoiceId) {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await deleteInvoice(invoiceId);
        if (response?.error) throw new Error(response.error);
        // Re-fetch invoices after successful deletion
        const updatedResponse = await getInvoices();
        if (updatedResponse?.error) throw new Error(updatedResponse.error);
        setInvoices(updatedResponse.invoices || []);
      } catch (err) {
        setError(err.message || 'Failed to delete invoice');
      } finally {
        setLoading(false);
      }
    }
  }
}
