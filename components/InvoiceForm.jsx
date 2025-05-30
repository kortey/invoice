'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be non-negative'),
  amount: z.number(),
});

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  subtotal: z.number().optional(),
  tax_amount: z.number().optional(),
  total: z.number().optional(),
});

function InvoiceForm({ clients, initialData, onSubmit }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
      items: [{ description: '', quantity: 1, price: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const subtotal = items?.reduce((sum, item) => sum + (item.quantity * item.price || 0), 0) || 0;
  const taxRate = watch('tax_rate') || 0;
  const discount = watch('discount') || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;
  

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, subtotal, tax_amount: taxAmount, total }))} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            {...register('client_id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            {...register('invoice_number')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.invoice_number && (
            <p className="mt-1 text-sm text-red-600">{errors.invoice_number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Date</label>
          <input
            type="date"
            {...register('issue_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.issue_date && (
            <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            {...register('due_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-6">
                <input
                  type="text"
                  placeholder="Description"
                  {...register(`items.${index}.description`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.items?.[index]?.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>
              
              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Quantity"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.items?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  {...register(`items.${index}.price`, { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.items?.[index]?.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.items[index]?.price?.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <p className="block w-full py-2">
                  GHC{(items[index]?.quantity || 0) * (items[index]?.price || 0)}
                </p>
              </div>

              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ description: '', quantity: 1, price: 0, amount: 0 })}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('tax_rate', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Discount</label>
          <input
            type="number"
            step="0.01"
            {...register('discount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>GHC{subtotal.toFixed(2)}</span>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between mt-2">
            <span>Tax ({taxRate}%):</span>
            <span>GHC{taxAmount.toFixed(2)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between mt-2">
            <span>Discount:</span>
            <span>-GHC{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between mt-2 font-bold">
          <span>Total:</span>
          <span>GHC{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
  );
}

export default InvoiceForm;
