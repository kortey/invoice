'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import InvoiceForm from '@/components/InvoiceForm';
import { getInvoiceById, updateInvoice as updateInvoiceAction } from '@/app/actions/invoice';
import { getClients } from '@/app/actions/client';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch invoice
        const invoiceRes = await getInvoiceById(invoiceId);
        if (invoiceRes?.error) throw new Error(invoiceRes.error);
        if (!cancelled) {
          setInvoice(invoiceRes.invoice);
          setItems(invoiceRes.invoice?.items || []);
        }
        // Fetch clients
        const clientsRes = await getClients();
        if (clientsRes?.error) throw new Error(clientsRes.error);
        if (!cancelled) setClients(clientsRes.clients || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load invoice');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (invoiceId) fetchData();
    return () => { cancelled = true; };
  }, [invoiceId]);

  const handleUpdate = async (data) => {
    setUpdating(true);
    setError(null);
    try {
      // Ensure client_id is present and correct
      if (!data.client_id) {
        throw new Error('Client is required.');
      }
      // Use the server action for updating invoice
      const result = await updateInvoiceAction(invoiceId, {
        ...data,
        client_id: data.client_id,
      });
      if (result?.error) throw new Error(result.error);
      router.push(`/dashboard/invoices/${invoiceId}`);
    } catch (err) {
      setError(err.message || 'Failed to update invoice');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error || !invoice || !items || !clients) {
    return <div>Invoice not found</div>;
  }

  const initialData = {
    ...invoice,
    items: items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
    })),
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Invoice #{invoice.invoice_number}</h1>
      <InvoiceForm
        clients={clients}
        initialData={initialData}
        onSubmit={handleUpdate}
        loading={updating}
      />
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
