const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requirePermission } = require('../middlewares/authMiddleware');


router.post('/search', 
    authenticateToken, 
    requirePermission([0, 1]),
    employeeController.searchEmployees
);

module.exports = router; 
