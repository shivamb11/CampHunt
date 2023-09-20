import {createRequire} from "module";

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const {Schema} = mongoose;

const reviewSchema = new Schema({
    rating : Number,
    body : String,    
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
})

const Review = mongoose.model('Review', reviewSchema);

export default Review;