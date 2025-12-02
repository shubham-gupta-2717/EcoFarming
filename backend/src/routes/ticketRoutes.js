const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    createTicket,
    getUserTickets,
    getAllTickets,
    updateTicketStatus
} = require('../controllers/ticketController');

// Farmer Routes
router.post('/', verifyToken, createTicket);
router.get('/my-tickets', verifyToken, getUserTickets);

// Admin Routes
router.get('/all', verifyToken, authorizeRole('admin', 'superadmin', 'institution'), getAllTickets);
router.put('/:id/status', verifyToken, authorizeRole('admin', 'superadmin', 'institution'), updateTicketStatus);

module.exports = router;
