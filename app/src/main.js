const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const os = require('os');
const process = require('process');

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const ENV = process.env.APP_ENV || 'dev';
const CPU_LIMIT = process.env.App_CPU_LIMIT || 'Unknown';
const MEM_LIMIT = process.env.APP_MEMORY_LIMIT || 'Unknown';

// Database Config from Env
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db',
    database: process.env.DB_NAME || 'webapp_db',
    password: process.env.DB_PASSWORD || 'password',
    port: 5432,
});

// --- Middleware ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'terraform-demo-secret',
    resave: false,
    saveUninitialized: false
}));

// --- Database Init (Code First) ---
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};
initDB();

// --- Routes ---

// Root -> Login
app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/home');
    res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('layout', { title: 'Login', body: '<%- include("login") %>', error: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.email = user.email;
            return res.redirect('/home');
        }
        res.render('layout', { title: 'Login', body: '<%- include("login") %>', error: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        res.render('layout', { title: 'Login', body: '<%- include("login") %>', error: 'Database error' });
    }
});

// Signup Page
app.get('/signup', (req, res) => {
    res.render('layout', { title: 'Sign Up', body: '<%- include("signup") %>', error: null });
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('layout', { title: 'Sign Up', body: '<%- include("signup") %>', error: 'User already exists or error' });
    }
});

// Dashboard
app.get('/home', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    
    // Check DB Connection
    let dbStatus = "Connected";
    try {
        await pool.query('SELECT NOW()');
    } catch (e) {
        dbStatus = "Disconnected";
    }

    res.render('layout', { 
        title: 'Home', 
        body: '<%- include("home") %>',
        user: { email: req.session.email },
        db_status: dbStatus,
        cpu_limit: CPU_LIMIT,
        mem_limit: MEM_LIMIT,
        env: ENV
    });
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Health & Metrics
app.get('/health', (req, res) => res.sendStatus(200));
app.get('/metrics', (req, res) => res.send('metrics_placeholder 1'));

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing pool and server.');
    pool.end();
    process.exit(0);
});
