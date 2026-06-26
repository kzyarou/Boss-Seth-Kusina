import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key
emailjs.init((import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  console.log('=== SENDING VERIFICATION EMAIL ===');
  console.log(`Verification code for ${email}: ${code}`);
  console.log('==================================');
  
  try {
    const templateParams = {
      to_email: email,
      passcode: code,
      time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString()
    };

    const response = await emailjs.send(
      (import.meta as any).env.VITE_EMAILJS_SERVICE_ID,
      (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
