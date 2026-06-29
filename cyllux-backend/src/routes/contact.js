const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { submitContact } = require('../controllers/contactController');

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters.'),
], submitContact);

module.exports = router;
