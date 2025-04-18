const express = require('express');
const router = express.Router();
const reports = require('../controllers/reports');
const { isLoggedIn, isAdmin } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Public routes
router.get('/new', reports.renderNewForm);
router.post('/', upload.single('evidence'), reports.createReport);

// Admin routes
router.get('/admin', isLoggedIn, isAdmin, reports.getAllReports);
router.get('/admin/:id', isLoggedIn, isAdmin, reports.getReportDetails);
router.patch('/admin/:id/status', isLoggedIn, isAdmin, reports.updateReportStatus);

// Render report form
router.get('/report', isLoggedIn, (req, res) => {
    res.render('pages/report-a-concern');
});

// Handle report submission
router.post('/report', isLoggedIn, upload.array('evidence', 5), async (req, res) => {
    try {
        const {
            reportType,
            bookingId,
            listingId,
            incidentDate,
            description,
            name,
            email,
            phone
        } = req.body;

        // Create new report
        const report = new Report({
            type: reportType,
            bookingId: bookingId || null,
            listingId: listingId || null,
            incidentDate,
            description,
            reporter: {
                name,
                email,
                phone
            },
            status: 'pending',
            evidence: req.files ? req.files.map(file => file.path) : []
        });

        await report.save();

        // Send confirmation email to user
        // TODO: Implement email sending

        req.flash('success', 'Your report has been submitted successfully. Our team will review it and get back to you shortly.');
        res.redirect('/pages/help-center');
    } catch (err) {
        console.error(err);
        req.flash('error', 'There was an error submitting your report. Please try again.');
        res.redirect('/report');
    }
});

// Admin route to view reports
router.get('/admin/reports', isLoggedIn, async (req, res) => {
    try {
        const reports = await Report.find().sort('-createdAt');
        res.render('admin/reports', { reports });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error fetching reports');
        res.redirect('/admin/dashboard');
    }
});

// Admin route to update report status
router.patch('/admin/reports/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const report = await Report.findByIdAndUpdate(
            id,
            { 
                status,
                adminNotes,
                updatedBy: req.user._id
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating report' });
    }
});

module.exports = router; 