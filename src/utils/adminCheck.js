// Check if user is admin based on email
export const isAdmin = (user) => {
  if (!user || !user.email) return false;
  
  const adminEmails = [
    'admin@hyvoice.com',
    'administrator@hyvoice.com',
    'superadmin@hyvoice.com',
    // Add your admin emails here
  ];
  
  return adminEmails.includes(user.email.toLowerCase()) || 
         user.email.toLowerCase().includes('admin');
};

// Check if user is municipal worker
export const isMunicipalWorker = (user) => {
  if (!user || !user.email) return false;
  
  const municipalDomains = [
    '@ghmc.gov.in',
    '@hyderabad.gov.in',
    '@telangana.gov.in',
    '@municipal.com'
  ];
  
  return municipalDomains.some(domain => 
    user.email.toLowerCase().endsWith(domain)
  );
};