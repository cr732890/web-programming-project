const { getDb, queryAll, run } = require('./db/database');

async function seedLabs() {
    await getDb();
    
    // Check existing labs
    const existingLabs = queryAll('SELECT id, title FROM labs');
    console.log('Existing labs:', existingLabs);
    
    if (existingLabs.length === 0) {
        console.log('\nSeeding new labs...');
        
        run('INSERT INTO labs (id, title, description, instructions, language) VALUES (?, ?, ?, ?, ?)',
            [1, "Ohm's Law", "Explore voltage, current, and resistance", "Adjust sliders to observe relationships", 'javascript']);
        
        run('INSERT INTO labs (id, title, description, instructions, language) VALUES (?, ?, ?, ?, ?)',
            [2, "Acid-Base Titration", "Learn titration techniques", "Follow the procedure step by step", 'javascript']);
        
        run('INSERT INTO labs (id, title, description, instructions, language) VALUES (?, ?, ?, ?, ?)',
            [3, "Photosynthesis Rate", "Investigate photosynthesis factors", "Adjust conditions and measure rate", 'javascript']);
        
        console.log('✓ Labs created successfully!');
    }
    
    const updatedLabs = queryAll('SELECT id, title FROM labs');
    console.log('\nFinal labs in database:', updatedLabs);
}

seedLabs().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
