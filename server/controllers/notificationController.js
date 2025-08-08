import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

export const createNotification = async (req, res) =>{
    const {username, bookTitle, bookId, email } = req.body;
    console.log('Notification request body:', req.body);

    if(!username || !bookTitle || !bookId || !email){
        return res.status(400).json({
            error: 'Missing book, bookId or email'
        });
    }

    try {
        //setup transporter (using SMTP or Gmail Credentials)
        const transporter = nodemailer.createTransport({
            service: 'yahoo',
            auth:{
                user: process.env.NOTIFY_EMAIL,
                pass: process.env.NOTIFY_EMAIL_PASSWORD
            }
        });

        const mailOptions ={
            from: `"Book Store App" <${process.env.NOTIFY_EMAIL}>`,
            to:email,
            subject: `BOOK STORE APP ::Notification Request Received – We’ll Let You Know When It’s Available`,
            //plain text version
            text: 
            `Dear ${username},\n\n

            Thank you for your interest in <strong>${bookTitle}</strong>. 
            We've received your notification request and will alert you as soon as it's available.
            \n\n
            Warm regards,\n
            Book Store Team
            `,
            //HTML version (for rich text formatting)
            html: 
            `
            <div style="font-size:13px; font-family:Cambria, san-serif;">
            <p>Dear ${username},</p>
            <p>Thank you for your interest in <strong>${bookTitle}</strong>.</p> 
            <p>We've received your notification request and will alert you as soon as it's available.</p>
            <p>
            Warm regards,<br>
            <strong>BOOK STORE Team</strong><br>
            +1(869)034-1124<br>
            www.bookstoreapp.store<br>
            </p>
            <p>Follow us on:</p>
            <p>
                <a href="https://facebook.com/" target="_blank" style="text-decoration:none">
                <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="margin-right:8px;" />
                </a>
                <a href="https://instagram.com/" target="_blank" style="text-decoration:none">
                <img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" style="margin-right:8px;" />
                </a>
                <a href="https://twitter.com/" target="_blank" style="text-decoration:none">
                <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" style="margin-right:8px;" />
                </a>
                <a href="https://linkedin.com/in/" target="_blank" style="text-decoration:none">
                <img src="https://cdn-icons-png.flaticon.com/24/733/733561.png" alt="LinkedIn" />
                </a>
            </p>
            <hr/>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({message: 'Notification email sent'});
    } catch (err) {
        console.error('Email error:', err);
        res.status(500).json({error: 'Failed to send notification email'});
        
    }
}