'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {createClient} from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Utility to check if a value is a Decimal or Big.js object
function isDecimal(val) {
  // Handles Prisma Decimal, PrismaDecimal, and Big.js (used by Prisma)
  return val && typeof val === 'object' && (
    val.constructor?.name === 'Decimal' ||
    val.constructor?.name === 'PrismaDecimal' ||
    typeof val.toNumber === 'function' // Big.js
  )
}

// Utility to convert Prisma Decimal fields to numbers recursively
function toPlainObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toPlainObject)
  } else if (obj && typeof obj === 'object') {
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    const plain = {}
    for (const key in obj) {
      if (isDecimal(obj[key])) {
        // Use toNumber if available, else Number()
        plain[key] = typeof obj[key].toNumber === 'function' ? obj[key].toNumber() : Number(obj[key])
      } else if (obj[key] instanceof Date) {
        plain[key] = obj[key].toISOString();
      } else {
        plain[key] = toPlainObject(obj[key])
      }
    }
    return plain
  }
  return obj
}

// Get all invoices for the current user
export async function getInvoices() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', invoices: [] }
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp_number: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return { invoices: toPlainObject(invoices), error: null }
  } catch (error) {
    console.error('Error fetching invoices with Prisma:', error)
    return { error: 'An unexpected error occurred', invoices: [] }
  }
}

// Get a single invoice by ID
export async function getInvoiceById(id) {
  try {
  
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', invoice: null }
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        user_id: user.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp_number:true,
            address: true,
          },
        },
        items: true,
      },
    })
    
    
    if (!invoice) {
      return { error: 'Invoice not found', invoice: null }
    }

    return { invoice: toPlainObject(invoice), error: null }
  } catch (error) {
    console.error('Error fetching invoice with Prisma:', error)
    return { error: 'An unexpected error occurred', invoice: null }
  }
}

// Create a new invoice
export async function createInvoice(formData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    console.log(formData)

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Parse form data
    const client_id = formData.get('client_id')
    const invoice_number = formData.get('invoice_number')
    const issue_date = formData.get('issue_date')
    const due_date = formData.get('due_date')
    const status = 'DRAFT'
    const notes = formData.get('notes') || ''
    const subtotal = parseFloat(formData.get('subtotal')) || 0
    const tax_rate = parseFloat(formData.get('tax_rate')) || 0
    const tax_amount = parseFloat(formData.get('tax_amount')) || 0
    const discount = parseFloat(formData.get('discount')) || 0
    const total = parseFloat(formData.get('total')) || 0

    // Parse items from JSON string
    const itemsJson = formData.get('items')
    let items = []
    try {
      items = JSON.parse(itemsJson)
    } catch (e) {
      return { error: 'Invalid items data', success: false }
    }

    // Ensure all items use 'price' and default numeric fields
    const safeItems = items.map(item => ({
      description: item.description,
      quantity: parseFloat(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0),
    }))

    // Calculate total amount
    const total_amount = safeItems.reduce(
      (sum, item) => sum + item.amount,
      0
    )

    // Create invoice and items in a transaction
    const invoice = await prisma.invoice.create({
      data: {
        user_id: user.id,
        client_id,
        invoice_number,
        issue_date: new Date(issue_date),
        due_date: new Date(due_date),
        status,
        subtotal: total_amount,
        notes,
        tax_rate,
        tax_amount,
        discount,
        total,
        updated_at: new Date(),
        items: {
          create: safeItems,
        },
      },
      include: {
        items: true,
      },
    })

    revalidatePath('/dashboard/invoices')
    return { success: true, invoice: toPlainObject(invoice), error: null }
  } catch (error) {
    console.error('Error creating invoice with Prisma:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}

// Update an existing invoice
export async function updateInvoice(id, formData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Support both FormData and plain object
    const getField = (key) => {
      if (formData instanceof FormData) return formData.get(key)
      return formData[key]
    }

    const client_id = getField('client_id')
    const invoice_number = getField('invoice_number')
    const issue_date = getField('issue_date')
    const due_date = getField('due_date')
    const status = getField('status')
    const notes = getField('notes')
    const tax_rate = parseFloat(getField('tax_rate')) || 0
    const tax_amount = parseFloat(getField('tax_amount')) || 0
    const discount = parseFloat(getField('discount')) || 0
    const total = parseFloat(getField('total')) || 0

    // Parse items from JSON string or array
    let items = []
    let itemsRaw = getField('items')
    if (typeof itemsRaw === 'string') {
      try {
        items = JSON.parse(itemsRaw)
      } catch (e) {
        return { error: 'Invalid items data', success: false }
      }
    } else if (Array.isArray(itemsRaw)) {
      items = itemsRaw
    } else if (itemsRaw) {
      items = [itemsRaw]
    }

    // Ensure all items use 'price' and default numeric fields
    const safeItems = items.map(item => ({
      description: item.description,
      quantity: parseFloat(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0),
    }))

    // Calculate total amount
    const total_amount = safeItems.reduce(
      (sum, item) => sum + item.amount,
      0
    )

    // Ensure invoice belongs to user
    const existing = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!existing || existing.user_id !== user.id) {
      return { error: 'Unauthorized or invoice not found', success: false }
    }

    // Update invoice
    await prisma.invoice.update({
      where: { id },
      data: {
        client_id,
        invoice_number,
        issue_date: new Date(issue_date),
        due_date: new Date(due_date),
        status,
        subtotal: total_amount,
        notes,
        tax_rate,
        tax_amount,
        discount,
        total,
        updated_at: new Date(),
      },
    })

    // Delete existing invoice items
    await prisma.invoiceItem.deleteMany({
      where: { invoice_id: id },
    })

    // Create new invoice items
    await prisma.invoiceItem.createMany({
      data: safeItems.map(item => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
      })),
    })

    revalidatePath(`/dashboard/invoices/${id}`)
    revalidatePath('/dashboard/invoices')
    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating invoice with Prisma:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}

// Delete an invoice
export async function deleteInvoice(id) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Check if the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice || invoice.user_id !== user.id) {
      return { error: 'Invoice not found or unauthorized', success: false }
    }

    // Delete invoice items first due to foreign key constraints
    await prisma.invoiceItem.deleteMany({
      where: { invoice_id: id },
    })

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id },
    })

    revalidatePath('/dashboard/invoices')
  } catch (error) {
    console.error('Error deleting invoice with Prisma:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}

// Send invoice via WhatsApp
export async function sendInvoiceViaWhatsApp(id) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Fetch invoice with related client and items
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
      },
    })

    if (!invoice || invoice.user_id !== user.id) {
      return { error: 'Invoice not found or unauthorized', success: false }
    }

    // Convert Decimal values to plain numbers
    const plainInvoice = toPlainObject(invoice);

    // Calculate totals from the actual values
    const subtotal = plainInvoice.items.reduce((sum, item) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      return sum + itemTotal;
    }, 0);

    const taxAmount = plainInvoice.tax_rate ? subtotal * (Number(plainInvoice.tax_rate) / 100) : 0;
    const discount = Number(plainInvoice.discount) || 0;
    const total = subtotal + taxAmount - discount;

    // Fetch user's profile information
      const profile = await prisma.profile.findUnique({
        where: { id: user.id }
      })

    if (!profile) {
      return { error: 'Business profile not found', success: false }
    }

    let clientPhone = invoice.client?.whatsapp_number?.replace(/[^0-9]/g, '') || ''
    if (!clientPhone) {
      return { error: 'Client phone number not available', success: false }
    }

    // Ensure phone number has a country code (default to '1' for US if missing)
    if (clientPhone.length === 10) {
      clientPhone = '1' + clientPhone
    }

    // Generate PDF URL using the new API endpoint
    const domain = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const pdfUrl = `${domain}/api/invoices/${id}/pdf`

    // Format the complete message using all available information
    const message = `
Hello ${plainInvoice.client.name},

Here's your invoice #${plainInvoice.invoice_number} from ${profile.business_name}.

*Amount Due: $${total.toFixed(2)}*
Due Date: ${new Date(plainInvoice.due_date).toLocaleDateString()}

You can download your invoice PDF using this link:
${pdfUrl}

Items:
${plainInvoice.items.map(item => `- ${item.description}: $${Number(item.price).toFixed(2)} x ${item.quantity} = $${(Number(item.price) * Number(item.quantity)).toFixed(2)}`).join('\n')}

Subtotal: $${subtotal.toFixed(2)}
${plainInvoice.tax_rate > 0 ? `Tax (${(Number(plainInvoice.tax_rate) * 100).toFixed(1)}%): $${taxAmount.toFixed(2)}\n` : ''}
${discount > 0 ? `Discount: $${discount.toFixed(2)}\n` : ''}
Total: $${total.toFixed(2)}

${profile.payment_details ? `Payment Details:
Bank: ${profile.payment_details.bank_name}
Account Number: ${profile.payment_details.account_number}
${profile.payment_details.routing_number ? `Routing Number: ${profile.payment_details.routing_number}` : ''}` : ''}

If you have any questions, please don't hesitate to contact us.

Thank you for your business!
${profile.business_name}`.trim()

    const whatsappLink = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`

    // Update invoice status to 'SENT'
    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENT',
        updated_at: new Date(),
      },
    })

    revalidatePath(`/dashboard/invoices/${id}`)
    return { success: true, whatsappLink, error: null }
  } catch (error) {
    console.error('Error sending invoice via WhatsApp:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(id) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Ensure the invoice belongs to the authenticated user
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice || invoice.user_id !== user.id) {
      return { error: 'Invoice not found or unauthorized', success: false }
    }

    // Update status to 'PAID'
    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        updated_at: new Date(),
      },
    })

    revalidatePath(`/dashboard/invoices/${id}`)
    revalidatePath('/dashboard/invoices')

    return { success: true, error: null }
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}

// Generate a new invoice number
export async function generateInvoiceNumber() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', invoiceNumber: null }
    }

    // Get the latest invoice by created_at
    const lastInvoice = await prisma.invoice.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      select: { invoice_number: true },
    })

    let nextNumber = 1

    if (lastInvoice?.invoice_number) {
      const match = lastInvoice.invoice_number.match(/(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1
      }
    }

    const year = new Date().getFullYear()
    const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(4, '0')}`

    return { invoiceNumber, error: null }
  } catch (error) {
    console.error('Error generating invoice number:', error)
    return { error: 'An unexpected error occurred', invoiceNumber: null }
  }
}
