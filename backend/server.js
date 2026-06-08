const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/matkul', require('./routes/matkul'));
app.use('/api/jadwal', require('./routes/jadwal'));
app.use('/api/nilai', require('./routes/nilai'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
  console.log(`EduTrack server running on http://localhost:${PORT}`);
});
