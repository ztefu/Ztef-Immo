"use server";

import { createAdminClient, createClient } from '@/utils/supabase/server';

export async function uploadContractAction(tenantId: string, base64Pdf: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: authCheck } = await supabase.from('tenants').select('id').eq('id', tenantId).single();
    if (!authCheck) {
      console.error('Unauthorized upload attempt for tenant:', tenantId);
      return null;
    }

    const adminClient = createAdminClient();
    const fileName = `${tenantId}/contrat_bail.pdf`;
    
    const base64Data = base64Pdf.includes(',') ? base64Pdf.split(',')[1] : base64Pdf;
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Magic Bytes Validation: Ensure it's actually a PDF
    if (buffer.length < 5 || buffer.toString('utf-8', 0, 5) !== '%PDF-') {
      console.error('Invalid file type uploaded for contract. Expected PDF magic bytes.');
      return null;
    }
    
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
    const supabase = await createClient();
    const { data: authCheck } = await supabase.from('payments').select('id').eq('id', paymentId).single();
    if (!authCheck) {
      console.error('Unauthorized upload attempt for payment:', paymentId);
      return null;
    }

    const adminClient = createAdminClient();
    const fileName = `receipts/${paymentId}_quittance.pdf`;
    
    const base64Data = base64Pdf.includes(',') ? base64Pdf.split(',')[1] : base64Pdf;
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Magic Bytes Validation: Ensure it's actually a PDF
    if (buffer.length < 5 || buffer.toString('utf-8', 0, 5) !== '%PDF-') {
      console.error('Invalid file type uploaded for receipt. Expected PDF magic bytes.');
      return null;
    }
    
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
