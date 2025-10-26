const db = require('../config/db');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, member_since, last_login FROM users WHERE id = ?', [req.user.userId]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.userId]);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getScans = async (req, res) => {
    try {
        const [scans] = await db.query('SELECT id, scan_type, result, timestamp FROM scans WHERE user_id = ? ORDER BY timestamp DESC', [req.user.userId]);
        res.json(scans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.predictSql = (req, res) => {
    const { query } = req.body;
    const userId = req.user.userId;

    const pyShell = new PythonShell('predict_sql.py', {
        mode: 'text',
        scriptPath: path.join(__dirname, '..'),
    });
    
    let predictionResult = '';
    pyShell.on('message', (message) => {
        predictionResult = message.trim();
    });

    pyShell.on('close', async () => {
        if (predictionResult === '') return res.status(500).json({ error: 'Analysis failed.' });
        const resultText = predictionResult === '1' ? 'Threat' : 'Clean';
        await db.query('INSERT INTO scans (user_id, scan_type, query_text, result) VALUES (?, ?, ?, ?)', [userId, 'SQL Injection', query, resultText]);
        res.json({ prediction: parseInt(predictionResult) });
    });

    pyShell.send(query);
};

exports.predictPhishing = (req, res) => {
    const { url } = req.body;
    const userId = req.user.userId;

    const pyShell = new PythonShell('predict_phishing.py', {
        mode: 'text',
        scriptPath: path.join(__dirname, '..'),
    });

    let predictionResult = '';
    pyShell.on('message', (message) => {
        predictionResult = message.trim();
    });

    pyShell.on('close', async () => {
        if (predictionResult === '') return res.status(500).json({ error: 'Analysis failed.' });
        const resultText = predictionResult === '1' ? 'Threat' : 'Clean';
        await db.query('INSERT INTO scans (user_id, scan_type, query_text, result) VALUES (?, ?, ?, ?)', [userId, 'Phishing URL', url, resultText]);
        res.json({ prediction: parseInt(predictionResult) });
    });

    pyShell.send(url);
};

exports.predictFile = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const userId = req.user.userId;
    const filePath = req.file.path;

    const options = {
        scriptPath: path.join(__dirname, '../'),
        args: [filePath]
    };

    PythonShell.run('predict_malware.py', options).then(async results => {
        const prediction = parseInt(results[0]);
        const resultText = prediction === 1 ? 'Threat' : 'Clean';
        await db.query('INSERT INTO scans (user_id, scan_type, query_text, result) VALUES (?, ?, ?, ?)', [userId, 'File Analysis', req.file.originalname, resultText]);
        fs.unlinkSync(filePath); // Delete the temporary file
        res.json({ prediction });
    }).catch(err => {
        fs.unlinkSync(filePath); // Also delete file on error
        console.error(err);
        res.status(500).json({ error: 'An error occurred during file analysis.' });
    });
};