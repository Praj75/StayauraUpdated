const Report = require('../models/report');
const Booking = require('../models/booking');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary } = require('../cloudinary');
const { catchAsync } = require('../utils/errorHandler');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/evidence';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
        }
    }
});

// Render new report form
exports.renderNewForm = catchAsync(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id, endDate: { $gte: new Date() } });
    res.render('reports/new', { bookings });
});

// Create a new report
exports.createReport = catchAsync(async (req, res) => {
    const report = new Report({
        ...req.body,
        user: req.user._id
    });
    await report.save();
    req.flash('success', 'Report submitted successfully');
    res.redirect('/dashboard');
});

// Get all reports (admin only)
exports.getAllReports = catchAsync(async (req, res) => {
    const reports = await Report.find()
        .populate('user', 'username email')
        .populate('bookingId')
        .sort('-createdAt');
    res.render('reports/admin/index', { reports });
});

// Get report details (admin only)
exports.getReportDetails = catchAsync(async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('user', 'username email')
        .populate('bookingId');
    if (!report) {
        req.flash('error', 'Report not found');
        return res.redirect('/reports/admin');
    }
    res.render('reports/admin/show', { report });
});

// Update report status (admin only)
exports.updateReportStatus = catchAsync(async (req, res) => {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status, adminNotes },
        { new: true, runValidators: true }
    );
    if (!report) {
        req.flash('error', 'Report not found');
        return res.redirect('/reports/admin');
    }
    req.flash('success', 'Report status updated successfully');
    res.redirect(`/reports/admin/${report._id}`);
}); 