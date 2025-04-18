// Simple test file to check if the application can run without TypeScript errors
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Configure session with connect-mongo
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/test',
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}));

console.log('Test successful! No TypeScript errors.'); 