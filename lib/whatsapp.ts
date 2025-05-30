import type { Invoice, Client, Profile } from '@/types';

export function formatWhatsAppMessage(invoice: Invoice, client: Client, profile: Profile): string {
  const message = `
Hello ${client.name},

Here's your invoice #${invoice.invoice_number} from ${profile.business_name}.

*Amount Due: $${invoice.total.toFixed(2)}*
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

You can view and download your invoice using this link:
${invoice.pdf_url}

Payment Details:
Bank: ${profile.payment_details.bank_name}
Account Number: ${profile.payment_details.account_number}
${profile.payment_details.routing_number ? `Routing Number: ${profile.payment_details.routing_number}` : ''}

If you have any questions, please don't hesitate to contact us.

Thank you for your business!
${profile.business_name}
`.trim();

  return encodeURIComponent(message);
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Remove any non-numeric characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

export function sendInvoiceViaWhatsApp(invoice: Invoice, client: Client, profile: Profile): void {
  const message = formatWhatsAppMessage(invoice, client, profile);
  const whatsappLink = generateWhatsAppLink(client.whatsapp_number, message);
  window.open(whatsappLink, '_blank');
}