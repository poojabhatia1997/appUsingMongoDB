var mongoose = require('mongoose');
var bcrypt = require('bcrypt')
var Schema = mongoose.Schema;

const UserSchema = new Schema({
	email: {
                 type: String,
                 allowNull: false,
                 unique: true
             },
    salt: String,
    password_hash: String,
    profileImage: {
                 type: String,
                 allowNull: true
             }

});

// Virtuals
UserSchema.virtual('password')
    // set methods
    .set(function (password) {
        this._password = password;
    });

UserSchema.pre("save", function (next) {
    // store reference
    const user = this;
    if (user._password === undefined) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) console.log(err);
        // hash the password using our new salt
        bcrypt.hash(user._password, salt, function (err, hash) {
            if (err) console.log(err);
            user.password_hash = hash;
            next();
        });
    });
});

UserSchema.methods = {
    comparePassword: function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    }
}

module.exports = mongoose.model('user',UserSchema);