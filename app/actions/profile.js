'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

// Get the current user's profile
export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', profile: null }
  }
  try {
    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    return { profile: profile || null, error: null }
  } catch (error) {
    return { error: error.message, profile: null }
  }
}

// Update the current user's profile
export async function updateProfile(data) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }
  try {
    // Check if profile exists
    const existing = await prisma.profile.findUnique({ where: { id: user.id } })
    const paymentDetails = data.payment_details || {};
    if (existing) {
      await prisma.profile.update({
        where: { id: user.id },
        data: {
          business_name: data.company_name,
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone,
          contact_info: {
            email: data.email,
            address: data.address,
            website: data.website,
            phone_number: data.phone,
          },
          payment_details: {
            bank_name: paymentDetails.bank_name,
            account_number: paymentDetails.account_number,
            routing_number: paymentDetails.routing_number,
          },
          updated_at: new Date(),
        },
      })
    } else {
      // Create new profile and link to user
      await prisma.profile.create({
        data: {
          business_name: data.company_name,
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone,
          contact_info: {
            email: data.email,
            address: data.address,
            website: data.website,
            phone_number: data.phone,
          },
          payment_details: {
            bank_name: paymentDetails.bank_name,
            account_number: paymentDetails.account_number,
            routing_number: paymentDetails.routing_number,
          },
          User: {
            connect: { id: user.id },
          },
        },
      })
    }
    return { success: true, error: null }
  } catch (error) {
    return { error: error.message, success: false }
  }
}

// Upload profile logo
export async function uploadProfileLogo(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }
  const logoFile = formData.get('logo')
  if (!logoFile) {
    return { error: 'No file provided', success: false }
  }
  // Upload file to storage (using supabase storage for file, but update Prisma profile)
  const fileExt = logoFile.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `logos/${fileName}`
  const { error: uploadError } = await supabase
    .storage
    .from('profile-logos')
    .upload(filePath, logoFile)
  if (uploadError) {
    return { error: uploadError.message, success: false }
  }
  // Get public URL
  const { data: publicURL } = supabase
    .storage
    .from('profile-logos')
    .getPublicUrl(filePath)
  try {
    await prisma.profile.update({
      where: { id: user.id },
      data: { logo_url: publicURL.publicUrl, updated_at: new Date() },
    })
    return { success: true, error: null }
  } catch (error) {
    return { error: error.message, success: false }
  }
}