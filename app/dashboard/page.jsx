'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { colors, tailwindClasses } from '@/utils/colors';
import { getInvoices } from '@/app/actions/invoice';
import { getClients } from '@/app/actions/client';

export default function DashboardPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // setIsLoading(true);
      try {
        // Use server actions to fetch data
        const [invoicesResult, clientsResult] = await Promise.all([
          getInvoices(),
          getClients()
        ]);
        
        setInvoices(invoicesResult.invoices || []);
        setClients(clientsResult.clients || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        // setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
   console.log(invoices)
   console.log(clients)
  // Calculate statistics
  const totalInvoices = invoices?.length || 0;
  const totalClients = clients?.length || 0;
  const paidInvoices = invoices?.filter(invoice => invoice.status === 'paid')?.length || 0;
  const pendingInvoices = invoices?.filter(invoice => invoice.status === 'pending')?.length || 0;
  
  // Calculate total revenue
  const totalRevenue = invoices?.reduce((sum, invoice) => {
    return sum + (invoice.total_amount || 0);
  }, 0) || 0;

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="flex items-center space-x-4">
  //         <div className="w-6 h-6 border-4 border-t-green-400 border-b-green-400 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
  //         <p className="text-white text-lg">Loading dashboard data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Invoices */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm">Total Invoices</p>
              <h3 className="text-3xl font-bold text-white mt-1">{totalInvoices}</h3>
            </div>
            <div className="p-3 bg-indigo-800/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/invoices" className="text-green-400 text-sm hover:text-green-300">
              View all invoices →
            </Link>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm">Total Clients</p>
              <h3 className="text-3xl font-bold text-white mt-1">{totalClients}</h3>
            </div>
            <div className="p-3 bg-indigo-800/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/clients" className="text-green-400 text-sm hover:text-green-300">
              View all clients →
            </Link>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-indigo-800/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-green-400 text-sm">+5% from last month</span>
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm">Invoice Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xl font-bold text-white">{paidInvoices} paid</span>
                <span className="text-gray-400">/</span>
                <span className="text-xl font-bold text-white">{pendingInvoices} pending</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-800/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700/50 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-green-400 to-teal-300 h-2.5 rounded-full" 
                style={{ width: `${totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Recent Invoices</h3>
        </div>
        <div className="divide-y divide-white/10">
          {invoices && invoices.length > 0 ? (
            invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 hover:bg-white/5 transition duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-800/50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Invoice #{invoice.invoice_number}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">${invoice.total_amount?.toFixed(2) || '0.00'}</div>
                      <div className="text-xs">
                        {invoice.status === 'paid' ? (
                          <span className="bg-green-400/20 text-green-300 px-2 py-1 rounded-full text-xs">Paid</span>
                        ) : (
                          <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full text-xs">Pending</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-gray-300 hover:text-white transition p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="text-gray-300 hover:text-white transition p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-800/50 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-300 mb-4">No invoices found. Create your first invoice!</p>
              <Link
                href="/dashboard/invoices/new"
                className="bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Create Invoice
              </Link>
            </div>
          )}
        </div>
        {invoices && invoices.length > 5 && (
          <div className="px-6 py-3 bg-indigo-800/30 border-t border-white/10">
            <Link href="/dashboard/invoices" className="text-green-400 text-sm hover:text-green-300 flex items-center justify-center">
              View all invoices
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="p-3 bg-indigo-800/50 rounded-lg inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">New Client</h3>
          <p className="text-gray-300 text-sm mb-4">Add a new client to your database</p>
          <Link
            href="/dashboard/clients"
            className="text-green-400 text-sm hover:text-green-300 flex items-center"
          >
            Add client
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="p-3 bg-indigo-800/50 rounded-lg inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">New Invoice</h3>
          <p className="text-gray-300 text-sm mb-4">Create a new invoice for your clients</p>
          <Link
            href="/dashboard/invoices/new"
            className="text-green-400 text-sm hover:text-green-300 flex items-center"
          >
            Create invoice
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:transform hover:-translate-y-1 transition duration-300">
          <div className="p-3 bg-indigo-800/50 rounded-lg inline-block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Update Profile</h3>
          <p className="text-gray-300 text-sm mb-4">Manage your account settings</p>
          <Link
            href="/dashboard/profile"
            className="text-green-400 text-sm hover:text-green-300 flex items-center"
          >
            Go to profile
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}