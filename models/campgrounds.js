import {createRequire} from "module";
import Review from "./reviews.js";

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const {Schema} = mongoose;

const imageSchema = new Schema({
    url : String,
    filename : String
})

imageSchema.virtual('cover')
    .get(function() {
        return this.url.replace('/upload', '/upload/ar_5:3,c_crop');
    })

imageSchema.virtual('thumbnail')
    .get(function() {
        return this.url.replace('/upload', '/upload/w_200');
    })

const opts = {toJSON  : {virtuals : true}};
const campgroundSchema = new Schema({
    title : String,
    location : String,
    geometry : {
        type : {
            type : String,
            enum : ['Point'],
            required : true,
        },
        coordinates : {
            type : [Number],
            required : true,
        }
    },
    description : String,
    price : Number,
    images : [imageSchema],
    date : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [{
        type : Schema.Types.ObjectId,
        ref : 'Review'
    }]
}, opts)

campgroundSchema.virtual('properties')
    .get(function() {
        return {
            id : this.id, 
            title : this.title,
            description : this.description
        }
    })

campgroundSchema.post('findOneAndDelete', async function(campground) {
    if(campground && campground.reviews.length) {
        await Review.deleteMany({_id : {$in : campground.reviews}});
    }
})

const Campground = mongoose.model('Campground', campgroundSchema);

export default Campground;