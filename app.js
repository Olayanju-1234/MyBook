const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose')
const logger = require('morgan'); 
const dotenv = require('dotenv')
const passport = require('passport')
const socketIO = require('socket.io')
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const compression = require("compression");
const helmet = require("helmet");


// Load config
dotenv.config({ path: './config/config.env' });
require('dotenv').config()

//  Passport config
require('./config/passport')(passport);

// Connect Mongoose
connectDB();



const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');


const app = express();
app.use(helmet());
app.use(compression()); // Compress all routes
const server = require('http').createServer(app);
const io = socketIO(server);

require('./socket/friends')(io);

// view engine setup
// Handlebars
// Handlebars Helpers
const { formatDate} = require('./routes/helpers/hbs');

app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main", 
helpers: {formatDate}, runtimeOptions: { allowProtoPropertiesByDefault: true,
allowProtoMethodsByDefault: true } }));
app.set('view engine', '.hbs');

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI})
  }))

app.use(logger('dev'));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Method override
app.use(methodOverride( (req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
})) 

// Cookie parser
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variable
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
}
);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/posts', postRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error/500');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
