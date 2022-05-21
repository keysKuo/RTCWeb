const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://sheldon124:Dung1247@cluster0.t7ddd.mongodb.net/RTCWeb?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Success');
    } catch (error) {
        console.log('Fail')
    }
}

module.exports  = { connect };