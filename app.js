import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import CampGround from './models/campground.js';
import Review from './models/review.js';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import ExpressError from './utils/ExpressError.js';
import catchAsync from './utils/catchAsync.js';
import { campgroundSchema, reviewSchema } from './schemas.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected');
});
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

app.get('/', (req, res) => {
    res.send('home');
});

app.get(
    '/campgrounds',
    catchAsync(async (req, res) => {
        const campgrounds = await CampGround.find({});
        res.render('campgrounds/index', { campgrounds });
    })
);

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post(
    '/campgrounds',
    validateCampground,
    catchAsync(async (req, res, next) => {
        const campground = new CampGround(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground.id}`);
    })
);

app.get(
    '/campgrounds/:id',
    catchAsync(async (req, res) => {
        const campground = await CampGround.findById(req.params.id).populate('reviews');
        console.log(campground);
        res.render('campgrounds/show', { campground });
    })
);

app.get(
    '/campgrounds/:id/edit',
    catchAsync(async (req, res) => {
        const campground = await CampGround.findById(req.params.id);
        res.render('campgrounds/edit', { campground });
    })
);

app.put(
    '/campgrounds/:id',
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.delete(
    '/campgrounds/:id',
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await CampGround.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    })
);

app.post(
    '/campgrounds/:id/reviews',
    validateReview,
    catchAsync(async (req, res) => {
        const campground = await CampGround.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { message = 'Something went Wrong!', statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong';
    res.status(statusCode).render('error', { err });
});
app.listen(3000, () => {
    console.log('3000 port listen');
});
