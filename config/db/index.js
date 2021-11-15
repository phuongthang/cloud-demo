const mongoose = require('mongoose');

async function connect (){
    await mongoose.connect('mongodb://localhost:27017/cloud_shop');
}

module.exports = {connect};