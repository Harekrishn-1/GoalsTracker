// Kisi user ko admin banane ke liye:
//   node src/makeAdmin.js your-email@example.com
//
// Pehle us email se normal signup karo, phir ye chalao.

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const run = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('Usage: node src/makeAdmin.js <email>');
        process.exit(1);
    }

    await mongoose.connect(process.env.DB_CONNECT_STRING);

    const user = await User.findOneAndUpdate(
        { emailId: email.toLowerCase() },
        { role: 'admin' },
        { new: true }
    );

    if (!user) {
        console.log('No user found with email:', email);
    } else {
        console.log(`${user.emailId} is now an admin.`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
