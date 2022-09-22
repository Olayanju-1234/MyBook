const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const { logger } = require('handlebars');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');


