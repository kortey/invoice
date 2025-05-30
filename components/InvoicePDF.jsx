'use client';

import React from 'react';

// Defensive date parsing utility
function parseDate(dateValue) {
  if (!dateValue) return '';
  if (dateValue instanceof Date && !isNaN(dateValue)) {
    return dateValue.toLocaleDateString();
  }
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const d = new Date(dateValue);
    return isNaN(d) ? '' : d.toLocaleDateString();
  }
  if (typeof dateValue === 'object' && dateValue !== null) {
    for (const key of ['value', 'date', 'iso', 'raw', 'string']) {
      if (dateValue[key] && typeof dateValue[key] === 'string') {
        const d = new Date(dateValue[key]);
        if (!isNaN(d)) return d.toLocaleDateString();
      }
    }
    if (typeof dateValue.toString === 'function') {
      const str = dateValue.toString();
      const d = new Date(str);
      if (!isNaN(d)) return d.toLocaleDateString();
    }
    if (typeof dateValue.toISOString === 'function') {
      const d = new Date(dateValue.toISOString());
      if (!isNaN(d)) return d.toLocaleDateString();
    }
  }
  return '';
}

function InvoicePDF({ invoice, client, profile, items }) {
  // Defensive: fallback to empty object if profile is null
  profile = profile || {};
  const contactInfo = profile.contact_info || {};
  const paymentDetails = profile.payment_details || {};

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = invoice.tax_rate ? (subtotal * (invoice.tax_rate / 100)) : 0;
  const discount = invoice.discount || 0;
  const total = subtotal + taxAmount - discount;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md">
      <div className="flex justify-between mb-6">
        <div>
          {profile.logo_url && <img src={profile.logo_url} alt="Logo" className="h-12 mb-2" />}
          <h1 className="text-2xl font-bold">{profile.business_name}</h1>
        </div>
        <div className="text-right text-sm">
          <p>Invoice #{invoice.invoice_number}</p>
          <p>Issue Date: {parseDate(invoice.issue_date)}</p>
          <p>Due Date: {parseDate(invoice.due_date)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">From</h2>
        <p>{profile.business_name}</p>
        <p>{contactInfo.email}</p>
        <p>{contactInfo.phone}</p>
        <p>{contactInfo.address}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Bill To</h2>
        <p>{client.name}</p>
        <p>{client.email}</p>
        <p>{client.whatsapp_number}</p>
        <p>{client.address}</p>
      </div>

      <table className="w-full text-sm border border-collapse mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{item.description}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">${item.price.toFixed(2)}</td>
              <td className="border px-4 py-2">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right text-sm mb-6">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        {invoice.tax_rate && <p>Tax ({invoice.tax_rate}%): ${taxAmount.toFixed(2)}</p>}
        {invoice.discount > 0 && <p>Discount: -${discount.toFixed(2)}</p>}
        <p className="font-bold text-base mt-2">Total: ${total.toFixed(2)}</p>
      </div>

      {invoice.notes && (
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Notes</h3>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-600 border-t pt-4">
        <p>Payment Details</p>
        <p>Bank: {paymentDetails.bank_name}</p>
        <p>Account Number: {paymentDetails.account_number}</p>
        {paymentDetails.routing_number && (
          <p>Routing Number: {paymentDetails.routing_number}</p>
        )}
      </div>
    </div>
  );
}

export default InvoicePDF;
