import {createRequire} from "module";

import catchAsync from "../utilities/catchAsync.js";
import {doesCampgroundExist, validateCampground, isLoggedIn, storeCamp, isCampgroundAuthor} from "../middleware.js";
import {index, renderNewForm, createCampground, showCampground, renderEditForm, updateCampground, deleteCampground} from "../controllers/campgrounds.js";
import {storage} from "../cloudinary/index.js";

const require = createRequire(import.meta.url);
const express = require('express');
const multer = require('multer');
const upload = multer({storage});

const router = express.Router();

router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(createCampground))

router.get('/new', isLoggedIn, renderNewForm)

router.route('/:id')
    .get(doesCampgroundExist, catchAsync(showCampground))
    .patch(doesCampgroundExist, isLoggedIn, isCampgroundAuthor, upload.array('images'), validateCampground, catchAsync(updateCampground))
    .delete(doesCampgroundExist, isLoggedIn, isCampgroundAuthor, catchAsync(deleteCampground))

router.get('/:id/edit', doesCampgroundExist, isLoggedIn, isCampgroundAuthor, catchAsync(renderEditForm))

export {router as campgroundRouter};