import { supabaseStorage } from '../supabase/config';

export const uploadToSupabase = async (file, userId) => {
  try {
    if (!file) return null;
    
    // Validate file size (max 5MB for free tier)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size should be less than 5MB');
    }
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `grievance-photos/${fileName}`;
    
    console.log('Uploading to Supabase:', filePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseStorage.storage
      .from('grievance-photos')
      .upload(filePath, file);
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Failed to upload photo');
    }
    
    // Get public URL
    const { data: urlData } = supabaseStorage.storage
      .from('grievance-photos')
      .getPublicUrl(filePath);
    
    console.log('Upload successful, URL:', urlData.publicUrl);
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('Upload function error:', error);
    return null;
  }
};