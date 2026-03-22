const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'lab.db');

async function seedDatabase() {
    const SQL = await initSqlJs();
    
    let db;
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Initialize schema
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS labs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            instructions TEXT,
            starter_code TEXT,
            language TEXT DEFAULT 'javascript',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            lab_id INTEGER NOT NULL,
            code TEXT NOT NULL,
            grade INTEGER,
            feedback TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            graded_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (lab_id) REFERENCES labs(id)
        );
    `);

    // Check if labs already exist
    const result = db.exec('SELECT COUNT(*) as count FROM labs');
    const labCount = result[0]?.values[0][0] || 0;

    if (labCount === 0) {
        console.log('Seeding sample labs...');
        
        const labs_data = [
            {
                title: "Ohm's Law",
                description: 'Explore the relationship between voltage, current, and resistance',
                instructions: 'Adjust the voltage and resistance sliders to observe the current change',
                language: 'javascript'
            },
            {
                title: 'Acid-Base Titration',
                description: 'Learn titration techniques in analytical chemistry',
                instructions: 'Follow the procedure to perform a titration experiment',
                language: 'javascript'
            },
            {
                title: 'Photosynthesis Rate',
                description: 'Investigate factors affecting photosynthesis',
                instructions: 'Adjust light intensity and temperature to measure photosynthesis rate',
                language: 'javascript'
            },
            {
                title: 'Simple Pendulum',
                description: 'Study simple harmonic motion using a pendulum',
                instructions: 'Vary the length and mass to observe period changes',
                language: 'javascript'
            },
            {
                title: 'Chemical Reactions',
                description: 'Observe different types of chemical reactions',
                instructions: 'Mix different substances and observe reactions',
                language: 'javascript'
            }
        ];

        labs_data.forEach(lab => {
            db.run(
                'INSERT INTO labs (title, description, instructions, language) VALUES (?, ?, ?, ?)',
                [lab.title, lab.description, lab.instructions, lab.language]
            );
        });

        console.log('✓ Sample labs created');
    } else {
        console.log(`✓ Database already has ${labCount} labs`);
    }

    // Save database
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    console.log('✓ Database saved successfully');
}

seedDatabase().catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
});
