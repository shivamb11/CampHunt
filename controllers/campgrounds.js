import { cloudinary } from "../cloudinary/index.js";
import Campground from "../models/campgrounds.js";

import {createRequire} from "module";
const require = createRequire(import.meta.url);

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapbox_token = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapbox_token});

const index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}

const renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

const createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send();
    const {campground} = req.body;
    const camp = new Campground(campground);
    camp.images = req.files.map( f => ({url : f.path, filename : f.filename}));
    const date = new Date();
    camp.date = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    camp.geometry = geoData.body.features[0].geometry;
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully created the campground !!');
    res.redirect(`/campgrounds/${camp._id}`);
}

const showCampground = async (req, res, next) => {
    const {id} = req.params;
    const campground = req.session.foundCampground;
    const obj = {
        name : 'shivam',
        age : 18
    }
    res.render('campgrounds/show', {campground, obj});
}

const renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = req.session.foundCampground;
    res.render('campgrounds/edit', {campground});
}

const updateCampground = async (req, res) => {
    const {id} = req.params;
    const campground = req.session.foundCampground;
    const camp = await Campground.findByIdAndUpdate(id, req.body.campground);
    const imgs = req.files.map( f => ({url : f.path, filename : f.filename}));
    camp.images.push(...imgs);
    await camp.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages}}}});
    }
    req.session.foundCampground = camp;
    req.flash('success', 'Successfully updated the campground !!');
    res.redirect(`/campgrounds/${id}`);
}

const deleteCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.session.foundCampground = null;
    req.flash('success', 'Successfully deleted the campground !!');
    res.redirect('/campgrounds');
}

export {index, renderNewForm, createCampground, showCampground, renderEditForm, updateCampground, deleteCampground};