const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');

// POST /api/contact
exports.submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;
    const contact = await ContactMessage.create({ name, email, message });

    // Fire-and-forget email notification (optional, won't fail the request)
    sendEmailNotification(contact).catch(err =>
      console.warn('Email notification failed:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Message received. We will get back to you shortly.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sends email via Nodemailer if SMTP is configured.
 * Falls back silently if credentials are not set.
 */
async function sendEmailNotification(contact) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Cyllux Contact Form" <${SMTP_USER}>`,
    to: CONTACT_RECEIVER || SMTP_USER,
    subject: `New enquiry from ${contact.name}`,
    text: `Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`,
  });
}
