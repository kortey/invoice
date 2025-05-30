// Define TypeScript interfaces based on the Prisma schema

export interface User {
  id: string;
  profiles?: Profile;
  clients?: Client[];
  invoices?: Invoice[];
}

export interface Profile {
  id: string;
  user_id: string;
  business_name: string;
  logo_url?: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
  payment_details: {
    bank_name: string;
    account_number: string;
    routing_number?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  notes?: string;
  tax_rate?: number;
  discount?: number;
  subtotal: number;
  total: number;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface CommunicationLog {
  id: string;
  invoice_id?: string;
  type: string;
  status: string;
  message?: string;
  timestamp: string;
}
