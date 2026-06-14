require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Notification.deleteMany({ type: 'post' });
    console.log('Cleared old post notifications');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
