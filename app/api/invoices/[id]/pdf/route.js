import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // FIX 1: Await params before accessing properties
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Fetch invoice with related data
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
      },
    })

    if (!invoice || invoice.user_id !== user.id) {
      return new NextResponse('Not found', { status: 404 })
    }

    // FIX 2: Use 'id' instead of 'user_id' for profile lookup
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile) {
      return new NextResponse('Profile not found', { status: 404 })
    }

    // Calculate totals from items (since they might not be stored in invoice)
    const subtotal = invoice.items.reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.quantity));
    }, 0);

    const taxAmount = invoice.tax_rate ? subtotal * (Number(invoice.tax_rate) / 100) : 0;
    const discount = Number(invoice.discount) || 0;
    const total = subtotal + taxAmount - discount;

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    // Generate HTML content for the PDF
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        .address-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .address-box { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; }
        .totals { text-align: right; }
        .total-row { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${profile.business_name || 'Your Business'}</h1>
        <h2>Invoice #${invoice.invoice_number}</h2>
      </div>

      <div class="invoice-details">
        <p><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
      </div>

      <div class="address-section">
        <div class="address-box">
          <h3>From:</h3>
          <p>${profile.business_name || 'Your Business'}<br>
          ${profile.email || ''}<br>
          ${profile.phone_number || ''}<br>
          ${profile.contact_info?.address || ''}</p>
        </div>
        <div class="address-box">
          <h3>Bill To:</h3>
          <p>${invoice.client.name}<br>
          ${invoice.client.email || ''}<br>
          ${invoice.client.whatsapp_number || ''}<br>
          ${invoice.client.address || ''}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>$${Number(item.price).toFixed(2)}</td>
              <td>$${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        ${invoice.tax_rate > 0 ? `<p><strong>Tax (${(Number(invoice.tax_rate) * 100).toFixed(1)}%):</strong> $${taxAmount.toFixed(2)}</p>` : ''}
        ${discount > 0 ? `<p><strong>Discount:</strong> $${discount.toFixed(2)}</p>` : ''}
        <p class="total-row"><strong>Total:</strong> $${total.toFixed(2)}</p>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <h3>Notes:</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}

      ${profile.payment_details ? `
        <div class="payment-details">
          <h3>Payment Details:</h3>
          <p>
            ${profile.payment_details.bank_name ? `Bank: ${profile.payment_details.bank_name}<br>` : ''}
            ${profile.payment_details.account_number ? `Account Number: ${profile.payment_details.account_number}<br>` : ''}
            ${profile.payment_details.routing_number ? `Routing Number: ${profile.payment_details.routing_number}` : ''}
          </p>
        </div>
      ` : ''}
    </body>
    </html>
    `

    // Set content and generate PDF
    await page.setContent(html)
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    // Return the PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return new NextResponse('Error generating PDF', { status: 500 })
  }
}