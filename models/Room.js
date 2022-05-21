const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Rooms = new Schema(
    {
        roomId: {type: String, unique: true},
        users: [String]
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Rooms', Rooms);