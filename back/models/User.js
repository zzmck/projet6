const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//creation du schema USER => email unique / password
const userSchema = mongoose.Schema({
    email:{ type:String, required:true, unique:true},
    password:{ type:String, required:true},
});
userSchema.plugin(uniqueValidator);

//export du models
module.exports=mongoose.model('User', userSchema);
