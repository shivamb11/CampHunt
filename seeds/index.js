import {createRequire} from "module";
const require = createRequire(import.meta.url);

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapbox_token = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapbox_token});
const dbUrl = process.env.DB_URL;

import {State} from "country-state-city";

import Campground from "../models/campgrounds.js";
import cities from "./cities.js";
import {descriptors, places} from "./seedhelpers.js";

mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGO CONNECTED SUCCESSFULLY");
    })
    .catch(() => {
        console.log("ERROR IN CONNECTION");
    })

const randomCity = () => cities[Math.floor(Math.random()*(cities.length))];
const randomTitle = () => `${descriptors[Math.floor(Math.random()*(descriptors.length))]} ${places[Math.floor(Math.random()*places.length)]}`;
const randomPrice = () => Math.floor(Math.random()*5000) + 1000;

const seedDB = async () => {
    await Campground.deleteMany({});

    for(let i=0; i<100; i++) {
        const city = randomCity();
        const state = State.getStateByCodeAndCountry(city.stateCode, 'IN');
        const date = new Date();
        const geoData = await geocoder.forwardGeocode({
            query : `${city.name}, ${state.name}`,
            limit : 1
        }).send();
        const campground = new Campground({
            author : '650ab3e28a85472364e877d6',
            title : randomTitle(),
            description : `A picturesque location surrounded by the hills and vast farms, this is the perfect place to camp with family or friends, get together, hold events etc. Look forward to trekking, rock climbing, shooting, team building activities, zorbing, cycling, farming, obstacle courses, village walks, astronomy and rocketry and a lot more.` ,
            location : `${city.name}, ${state.name}`,
            geometry : geoData.body.features[0].geometry,
            price : randomPrice(),
            images : [
                {
                    url: 'https://res.cloudinary.com/dvskfijru/image/upload/v1695200603/CampHunt/baikang-yuan-VDYAsdbHVhc.jpg',
                    filename: 'CampHunt/baikang-yuan-VDYAsdbHVhc'
                },
                {
                url: 'https://res.cloudinary.com/dvskfijru/image/upload/v1695200622/CampHunt/neom-wTmGtmGQCjQ.jpg',
                filename: 'CampHunt/neom-wTmGtmGQCjQ'
                }
            ],
            date : `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
        })
        await campground.save();
    }
}

seedDB()
    .then(() => mongoose.connection.close());