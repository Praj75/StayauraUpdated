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
    const pageTitle = 'Help Center';
    if (viewExists('pages/help-center')) {
        res.render('pages/help-center', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Get help with your bookings, account, and more.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/safety-information', (req, res) => {
    const pageTitle = 'Safety Information';
    if (viewExists('pages/safety-information')) {
        res.render('pages/safety-information', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Learn about our safety measures and guidelines.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/cancellation-options', (req, res) => {
    const pageTitle = 'Cancellation Options';
    if (viewExists('pages/cancellation-options')) {
        res.render('pages/cancellation-options', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Understand our cancellation policies and options.',
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
            description: 'Learn about our response to the COVID-19 pandemic.',
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
            description: 'Information about accessibility and accommodations.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/report-a-concern', (req, res) => {
    const pageTitle = 'Report a Concern';
    if (viewExists('pages/report-a-concern')) {
        res.render('pages/report-a-concern', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Report any issues or concerns you may have.',
            lastUpdated: new Date().toISOString()
        });
    }
});

// Community pages
router.get('/stayaura-cares', (req, res) => {
    const pageTitle = 'Stayaura Cares';
    if (viewExists('pages/stayaura-cares')) {
        res.render('pages/stayaura-cares', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Our commitment to social responsibility.',
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
            description: 'How we support refugees and displaced people.',
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
            description: 'Our commitment to diversity and inclusion.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/anti-discrimination', (req, res) => {
    const pageTitle = 'Anti-Discrimination';
    if (viewExists('pages/anti-discrimination')) {
        res.render('pages/anti-discrimination', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Our policies against discrimination.',
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
            description: 'Learn how to become a host.',
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
            description: 'Learn about host protection programs.',
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
            description: 'Resources for hosts.',
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
            description: 'Connect with other hosts.',
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
            description: 'Guidelines for responsible hosting.',
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
            description: 'Latest news and updates.',
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
            description: 'Explore our platform features.',
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
            description: 'Join our team.',
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
            description: 'Information for investors.',
            lastUpdated: new Date().toISOString()
        });
    }
});

router.get('/stayaura-luxe', (req, res) => {
    const pageTitle = 'Stayaura Luxe';
    if (viewExists('pages/stayaura-luxe')) {
        res.render('pages/stayaura-luxe', { title: pageTitle });
    } else {
        res.render('pages/generic-page', { 
            title: pageTitle,
            description: 'Premium accommodations.',
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
            description: 'Our privacy policy.',
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
            description: 'Our terms of service.',
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
            description: 'Site navigation map.',
            lastUpdated: new Date().toISOString()
        });
    }
});

module.exports = router; 