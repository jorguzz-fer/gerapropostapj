import { Resend } from 'resend';

// Initialize Resend with API Key from environment variables
// If no key is provided, it will log to console instead of sending (for dev)
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    cc?: string[];
    bcc?: string[];
}

export async function sendEmail({ to, subject, html, cc, bcc }: EmailPayload): Promise<boolean> {
    if (!resend) {
        console.log("---------------------------------------------------");
        console.log(`[Mock Email] To: ${to}`);
        console.log(`[Mock Email] CC: ${cc?.join(', ')}`);
        console.log(`[Mock Email] BCC: ${bcc?.join(', ')}`);
        console.log(`[Mock Email] Subject: ${subject}`);
        console.log(`[Mock Email] Content Length: ${html.length} chars`);
        console.log("---------------------------------------------------");
        return true;
    }

    try {
        const data = await resend.emails.send({
            from: 'WOW+ <nao-responda@wowmais.com.br>', // Verify this sender domain in Resend
            to,
            cc,
            bcc,
            subject,
            html,
        });

        if (data.error) {
            console.error("Resend API Error:", data.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}
