"use client"

import Image from 'next/image';
import Link from 'next/link'; // Import Link for client-side navigation
import { FiCheck, FiMessageSquare, FiFileText, FiZap, FiSmartphone } from 'react-icons/fi';
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const getStartedLink = user ? '/dashboard' : '/sign-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 text-white">
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-3xl font-extrabold text-white">Invoice</span>
          </div>
          {/* Removed the redundant "Start Generating" button from header */}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">Generate Invoices</span>
            <span className="block text-green-400">Effortlessly via WhatsApp</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create professional invoices and send them directly to your clients.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link
                href={getStartedLink}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-green-400 hover:bg-green-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                Start Generating
              </Link>
            </div>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="relative w-full max-w-4xl rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 flex items-center px-4">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <Image
                src="/images/invoicedashboard.PNG"
                alt="Invoice dashboard preview"
                width={1000}
                height={750}
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-800 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-green-400 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Streamline Your Billing Process
              </p>
            </div>

            <div className="mt-16">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <FiZap className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-white">Instant Invoice Creation</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Generate professional invoices quickly and efficiently.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <FiMessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-white">Direct WhatsApp Delivery</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Send invoices directly to your clients' WhatsApp for instant delivery.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <FiSmartphone className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-white">Mobile-Friendly Interface</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Manage your invoices seamlessly from any mobile device.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <FiFileText className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-white">Professional Templates</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Utilize clean and professional invoice templates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-12">
              <h2 className="text-base text-green-400 font-semibold tracking-wide uppercase">How it works</h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Simple Steps to Send Invoices
              </p>
            </div>

            <div className="mt-10">
              <div className="relative">
                <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-700"></div>
                
                <div className="relative mb-12">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-white">Add a Client</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Easily add and manage your client details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mb-12">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-white">Create Invoice</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Generate professional invoices with all necessary details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-white">Send Directly via WhatsApp</h3>
                      <p className="mt-2 text-base text-gray-300">
                        Deliver the invoice instantly to your client's WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-indigo-800">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to simplify your billing?</span>
              <span className="block">Start sending invoices today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
               Completely free to use.
            </p>
            <Link
              href={getStartedLink}
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-800 bg-white hover:bg-indigo-50 sm:w-auto"
            >
              Start Generating
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Invoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
