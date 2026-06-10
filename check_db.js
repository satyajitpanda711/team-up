const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/team-up');
  const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: String, githubId: String, image: String
  }));
  const users = await User.find({});
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}
check().catch(console.error);
