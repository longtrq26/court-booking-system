export function verificationEmailTemplate(name: string, url: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #2c3e50; text-align: center;">Welcome to Sport Court Booking!</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for registering. Please confirm your email address to activate your account and start booking courts.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Verify My Account
        </a>
      </div>

      <p style="color: #7f8c8d; font-size: 0.9em;">
        Or click this link: <br>
        <a href="${url}">${url}</a>
      </p>
      
      <p>Best regards,<br>The Sport Court Team</p>
    </div>
  `;
}
