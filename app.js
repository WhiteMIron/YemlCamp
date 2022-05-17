import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import CampGround from './models/campground.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected');
});
const app = express();

app.set('view-engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.send('home');
});

app.get('/makecampground', async (req, res) => {
    const camp = new CampGround({ title: 'My Backyard', description: 'cheep camping!' });
    await camp.save();
    res.send(camp);
});

app.listen(3000, () => {
    console.log('3000 port listen');
});
