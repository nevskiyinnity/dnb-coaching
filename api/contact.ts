// Location: /api/contact.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

const contactSchema = z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().email(),
    message: z.string().trim().min(1),
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    console.log('--- API function started ---');

    if (req.method !== 'POST') {
        console.log(`Method ${req.method} not allowed`);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        console.log('Request body:', req.body);
        const validatedData = contactSchema.parse(req.body);
        console.log('Validation successful. Data:', validatedData);

        console.log('Attempting to send email with Resend...');
        const { data, error } = await resend.emails.send({
            from: 'site@dnbcoaching.com',
            to: ['info@dnbcoaching.com'], // <<-- Make sure this is your real email
            subject: `New message from ${validatedData.name}`,
            replyTo: validatedData.email,
            html: `<p>Name: ${validatedData.name}</p><p>Email: ${validatedData.email}</p><p>Message: ${validatedData.message}</p>`,
        });

        // CRITICAL: Log the response from Resend
        if (error) {
            console.error('Resend returned an error:', error);
            return res.status(500).json({ message: 'Error from email provider.', error });
        }

        console.log('Resend returned data:', data);
        console.log('--- API function successful ---');
        return res.status(200).json({ message: 'Message sent successfully!', data });

    } catch (error) {
        console.error('--- ERROR CAUGHT IN API ---:', error);
        return res.status(500).json({ message: 'An unexpected error occurred.' });
    }
}