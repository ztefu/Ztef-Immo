"use server";

import { createAdminClient } from '@/utils/supabase/server';

export async function uploadContractAction(tenantId: string, base64Pdf: string): Promise<string | null> {
  try {
    const adminClient = createAdminClient();
    const fileName = `${tenantId}/contrat_bail.pdf`;
    
    // base64Pdf might contain the data URL prefix, we strip it out if present
    const base64Data = base64Pdf.includes(',') ? base64Pdf.split(',')[1] : base64Pdf;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const { error } = await adminClient.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
      
    if (error) {
      console.error('Error uploading contract PDF:', error);
      return null;
    }
    
    const { data: publicUrlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(fileName);
      
    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    
    // Update tenant in database
    const { error: updateError } = await adminClient
      .from('tenants')
      .update({ contract_url: publicUrl })
      .eq('id', tenantId);
      
    if (updateError) {
      console.error('Error updating tenant with contract_url:', updateError);
      throw updateError;
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadContractAction:', error);
    return null;
  }
}

export async function uploadReceiptAction(paymentId: string, base64Pdf: string): Promise<string | null> {
  try {
    const adminClient = createAdminClient();
    const fileName = `receipts/${paymentId}_quittance.pdf`;
    
    // base64Pdf might contain the data URL prefix, we strip it out if present
    const base64Data = base64Pdf.includes(',') ? base64Pdf.split(',')[1] : base64Pdf;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const { error } = await adminClient.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
      
    if (error) {
      console.error('Error uploading receipt PDF:', error);
      return null;
    }
    
    const { data: publicUrlData } = adminClient.storage
      .from('documents')
      .getPublicUrl(fileName);
      
    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    
    // Update payment in database
    const { error: updateError } = await adminClient
      .from('payments')
      .update({ receipt_url: publicUrl })
      .eq('id', paymentId);
      
    if (updateError) {
      console.error('Error updating payment with receipt_url:', updateError);
      throw updateError;
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadReceiptAction:', error);
    return null;
  }
}
