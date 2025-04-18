const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const crypto = require("crypto");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

// Function to check if a view exists
const viewExists = (viewPath) => {
  const fullPath = path.join(__dirname, '..', 'views', viewPath + '.ejs');
  return fs.existsSync(fullPath);
};

// Support pages
router.get('/help-center', (req, res) => {
    res.render('pages/help-center', { title: 'Help Center' });
});

router.get('/safety-information', (req, res) => {
    res.render('pages/safety-information', { title: 'Safety Information' });
});

router.get('/cancellation-options', (req, res) => {
    const pageTitle = 'Cancellation Options';
    if (viewExists('pages/cancellation-options')) {
        res.render('pages/cancellation-options', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Learn about our cancellation policies and options.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/covid-19-response', (req, res) => {
    const pageTitle = 'COVID-19 Response';
    if (viewExists('pages/covid-19-response')) {
        res.render('pages/covid-19-response', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Information about our response to COVID-19 and safety measures.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/guests-with-disabilities', (req, res) => {
    const pageTitle = 'Guests with Disabilities';
    if (viewExists('pages/guests-with-disabilities')) {
        res.render('pages/guests-with-disabilities', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Resources and information for guests with disabilities.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/report-a-concern', (req, res) => {
    res.render('pages/report-a-concern', { title: 'Report a Concern' });
});

// Community pages
router.get('/stayaura-cares', (req, res) => {
    const pageTitle = 'StayAura Cares';
    if (viewExists('pages/stayaura-cares')) {
        res.render('pages/stayaura-cares', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Learn about our community initiatives and social impact programs.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/support-refugees', (req, res) => {
    const pageTitle = 'Support Refugees';
    if (viewExists('pages/support-refugees')) {
        res.render('pages/support-refugees', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Information about our refugee support programs and initiatives.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/diversity-inclusion', (req, res) => {
    const pageTitle = 'Diversity & Inclusion';
    if (viewExists('pages/diversity-inclusion')) {
        res.render('pages/diversity-inclusion', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Our commitment to diversity, equity, and inclusion.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/anti-discrimination', (req, res) => {
    const pageTitle = 'Anti-discrimination';
    if (viewExists('pages/anti-discrimination')) {
        res.render('pages/anti-discrimination', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Our anti-discrimination policies and commitment to equality.',
            lastUpdated: new Date().toISOString()
        });
    }
});

// Hosting pages
router.get('/try-hosting', (req, res) => {
    const pageTitle = 'Try Hosting';
    if (viewExists('pages/try-hosting')) {
        res.render('pages/try-hosting', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Learn how to become a host on StayAura.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/protection-for-hosts', (req, res) => {
    const pageTitle = 'Protection for Hosts';
    if (viewExists('pages/protection-for-hosts')) {
        res.render('pages/protection-for-hosts', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Information about our host protection programs and insurance.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/explore-resources', (req, res) => {
    const pageTitle = 'Explore Resources';
    if (viewExists('pages/explore-resources')) {
        res.render('pages/explore-resources', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Resources and guides for hosts and guests.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/community-forum', (req, res) => {
    const pageTitle = 'Community Forum';
    if (viewExists('pages/community-forum')) {
        res.render('pages/community-forum', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Connect with other hosts and guests in our community forum.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/responsible-hosting', (req, res) => {
    const pageTitle = 'Responsible Hosting';
    if (viewExists('pages/responsible-hosting')) {
        res.render('pages/responsible-hosting', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Guidelines and best practices for responsible hosting.',
            lastUpdated: new Date().toISOString()
        });
    }
});

// About pages
router.get('/newsroom', (req, res) => {
    const pageTitle = 'Newsroom';
    if (viewExists('pages/newsroom')) {
        res.render('pages/newsroom', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Latest news and updates from StayAura.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/features', (req, res) => {
    const pageTitle = 'Features';
    if (viewExists('pages/features')) {
        res.render('pages/features', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Explore the features that make StayAura unique.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/careers', (req, res) => {
    const pageTitle = 'Careers';
    if (viewExists('pages/careers')) {
        res.render('pages/careers', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Join our team and help shape the future of travel.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/investors', (req, res) => {
    const pageTitle = 'Investors';
    if (viewExists('pages/investors')) {
        res.render('pages/investors', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Information for investors and financial reports.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/stayaura-luxe', (req, res) => {
    const pageTitle = 'StayAura Luxe';
    if (viewExists('pages/stayaura-luxe')) {
        res.render('pages/stayaura-luxe', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Discover our luxury accommodation offerings.',
            lastUpdated: new Date().toISOString()
        });
    }
});

// Legal pages
router.get('/privacy', (req, res) => {
    const pageTitle = 'Privacy Policy';
    if (viewExists('pages/privacy')) {
        res.render('pages/privacy', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Our privacy policy and data protection practices.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/terms', (req, res) => {
    const pageTitle = 'Terms of Service';
    if (viewExists('pages/terms')) {
        res.render('pages/terms', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Our terms of service and user agreement.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/sitemap', (req, res) => {
    const pageTitle = 'Sitemap';
    if (viewExists('pages/sitemap')) {
        res.render('pages/sitemap', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Navigate all pages and sections of our website.',
            lastUpdated: new Date().toISOString()
        });
    }
});

module.exports = router; 