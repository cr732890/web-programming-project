const { getDb, queryAll } = require('./db/database');

async function viewAllSubmissions() {
    try {
        await getDb();
        
        const submissions = queryAll(`
            SELECT 
                s.id as submission_id,
                s.code,
                s.submitted_at,
                s.grade,
                s.feedback,
                u.id as user_id,
                u.name as student_name,
                u.username,
                l.id as lab_id,
                l.title as lab_title
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN labs l ON s.lab_id = l.id
            ORDER BY s.submitted_at DESC
        `);

        if (submissions.length === 0) {
            console.log('\n📭 No submissions found.\n');
            return;
        }

        console.log('\n📋 ALL SUBMISSIONS\n');
        console.log('═'.repeat(100));
        
        submissions.forEach((sub, index) => {
            console.log(`\n${index + 1}. Submission ID: ${sub.submission_id}`);
            console.log(`   Student: ${sub.student_name} (${sub.username})`);
            console.log(`   Lab: ${sub.lab_title}`);
            console.log(`   Submitted: ${sub.submitted_at}`);
            console.log(`   Grade: ${sub.grade !== null ? sub.grade + '/100' : 'Not graded'}`);
            if (sub.feedback) {
                console.log(`   Feedback: ${sub.feedback}`);
            }
            console.log(`\n   📝 SUBMITTED CODE/TEXT:`);
            console.log(`   ${'-'.repeat(96)}`);
            
            // Display code with line numbers
            const lines = sub.code.split('\n');
            lines.forEach((line, lineNum) => {
                console.log(`   ${String(lineNum + 1).padStart(4, ' ')} | ${line}`);
            });
            
            console.log(`   ${'-'.repeat(96)}`);
        });
        
        console.log('\n' + '═'.repeat(100));
        console.log(`\nTotal Submissions: ${submissions.length}\n`);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

viewAllSubmissions();

