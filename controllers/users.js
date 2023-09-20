import User from "../models/users.js";

const renderRegisterForm = (req, res) => {
    res.render('users/register');
}

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash('success', 'Welcome to CampHunt');
            res.redirect('/campgrounds');
        })
    }
    catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

const renderLoginForm = (req, res) => {
    res.render('users/login');
}

const loginUser = (req, res) => {
    req.flash('success', 'Welcome to CampHunt!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

const logoutUser = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}

export {renderRegisterForm, registerUser, renderLoginForm, loginUser, logoutUser};