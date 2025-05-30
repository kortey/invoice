'use server'

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma' 
import { revalidatePath } from 'next/cache'



// CREATE A NEW USER IF USER DOES NOT EXIST
export async function createUserIfNotExists(user) {
  const supabase = createClient()

  if (!user) {
    throw new Error('Not authenticated')
  }


  const userId = user.id

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if(existingUser){
    console.log('this user already exist')
  }

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId, // Supabase Auth user ID
        // You can also store email or other profile info if needed
      },
    })
  }
}




// Get all clients for the current user

export async function getClients() {
  try {
    const cookieStore = cookies()
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated', clients: [] }
    }
    
    createUserIfNotExists(user)
    const { data: clients, error } = await supabase
      .from('Client')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching clients:', error)
      return { error: error.message, clients: [] }
    }
    
    return { clients, error: null }
  } catch (error) {
    console.error('Unexpected error in getClients:', error)
    return { error: 'An unexpected error occurred', clients: [] }
  }
}

// Get a single client by ID


export async function getClientById(id) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', client: null }
    }

    // Use Prisma to fetch the client by ID and user_id
    const client = await prisma.client.findFirst({
      where: {
        id: id,
        user_id: user.id,
      },
    })

    if (!client) {
      return { error: 'Client not found', client: null }
    }

    return { client, error: null }
  } catch (error) {
    console.error('Unexpected error in getClientById:', error)
    return { error: 'An unexpected error occurred', client: null }
  }
}



export async function addClient(formData) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user)


    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Parse form data
    const name = formData.get('name') 
    const email = formData.get('email') 
    const whatsapp_number = formData.get('whatsapp_number') 
    const address = formData.get('address')
    const notes = formData.get('notes') 
    console.log('Form Data:', formData)

    // Insert client into the database using Prisma
    const client = await prisma.client.create({
      data: {
        user: {
          connect: {
            id: user.id
          }
        },
        name,
        email,
        whatsapp_number,
        address,
        notes
      }
    })

    revalidatePath('/dashboard/clients')
    return { success: true, client, error: null }

  } catch (error) {
    console.error('Unexpected error in addClient:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}


// Update an existing client


export async function updateClient(id, formData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    // Parse form data
    const name = formData.get('name')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const address = formData.get('address')
    const notes = formData.get('notes')

    // Update the client using Prisma, ensuring user owns the record
    const updatedClient = await prisma.client.updateMany({
      where: {
        id,
        user_id: user.id,
      },
      data: {
        name,
        email,
        whatsapp_number: phone, // if your Prisma model uses this field
        address,
        notes,
        updated_at: new Date(), // assuming your Prisma model has this field
      },
    })

    if (updatedClient.count === 0) {
      return { error: 'Client not found or unauthorized', success: false }
    }

    revalidatePath('/dashboard/clients')

    return { success: true, client: { id, name, email, phone, address, notes }, error: null }
  } catch (error) {
    console.error('Unexpected error in updateClient:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}


// Delete a client

export async function deleteClient(id) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    

    if (!user) {
      return { error: 'Not authenticated', success: false }
    }

    const userId = user.id

    // Check if client has any invoices
    const hasInvoices = await prisma.invoice.findFirst({
      where: {
        client_id: id,
        user_id: userId,
      },
      select: { id: true },
    })

    if (hasInvoices) {
      return {
        error: 'Cannot delete client with existing invoices. Delete the invoices first.',
        success: false,
      }
    }

    // Delete the client
    const deleted = await prisma.client.deleteMany({
      where: {
        id,
        user_id: userId,
      },
    })

    if (deleted.count === 0) {
      return { error: 'Client not found or unauthorized', success: false }
    }

    revalidatePath('/dashboard/clients')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error in deleteClient:', error)
    return { error: 'An unexpected error occurred', success: false }
  }
}
