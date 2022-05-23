import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Review from './review.js';

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            id: {
                $in: doc.reviews,
            },
        });
    }
});

export default mongoose.model('Campground', CampgroundSchema);
