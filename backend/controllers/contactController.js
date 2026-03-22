import nodemailer from 'nodemailer';

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
export const sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Create a transporter
        // Note: User needs to provide SMTP credentials in .env
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: 'aadhiranbabyproducts@gmail.com',
            subject: `Contact Form: ${subject}`,
            text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
            replyTo: email
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Email sent successfully' });
        } else {
            // Fallback for development if no credentials provided
            console.log('--- Email Simulation ---');
            console.log('To: aadhiranbabyproducts@gmail.com');
            console.log('From:', email);
            console.log('Subject:', subject);
            console.log('Message:', message);
            console.log('------------------------');
            
            // Still return success so frontend works, but log the warning
            res.status(200).json({ 
                message: 'Message received (Simulation). Please configure EMAIL_USER and EMAIL_PASS for actual delivery.',
                simulated: true 
            });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
};
