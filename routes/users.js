import {createRequire} from "module";

import catchAsync from "../utilities/catchAsync.js";
import {storeReturnTo} from "../middleware.js";
import {renderRegisterForm, registerUser, renderLoginForm, loginUser, logoutUser} from "../controllers/users.js"

const require = createRequire(import.meta.url);
const express = require('express');
const passport = require('passport');

const router = express.Router();

router.route('/register')
    .get(renderRegisterForm)
    .post(catchAsync(registerUser))

router.route('/login')
    .get(renderLoginForm)
    .post(storeReturnTo, passport.authenticate('local', {failureRedirect : '/login', failureFlash : true}), loginUser)

router.get('/logout', logoutUser)

export {router as userRouter};