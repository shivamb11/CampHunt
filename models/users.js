import {createRequire} from "module";

const require=createRequire(import.meta.url);
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const {Schema} = mongoose;

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
    }
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

export default User;