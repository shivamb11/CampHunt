import {createRequire} from "module";

const require = createRequire(import.meta.url);

const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type : 'string',
    base : joi.string(),
    messages : {
        'string.escapeHTML' : '{{#label}} must not include HTML!'
    },
    rules : {
        escapeHTML : {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags : [],
                    allowedAttributes : {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension);

const campgroundSchema = Joi.object({
    campground : Joi.object({
        title : Joi.string().required().escapeHTML(),
        location : Joi.string().required().escapeHTML(),
        description : Joi.string().required().escapeHTML(),
        price : Joi.number().min(0).required(),
        // image : Joi.string().required(),
    }).required(),
    deleteImages : Joi.array()
})

const reviewSchema = Joi.object({
    review : Joi.object({
        rating : Joi.number().min(1).required(),
        body : Joi.string().required().escapeHTML()
    }).required()
})

export {campgroundSchema, reviewSchema};