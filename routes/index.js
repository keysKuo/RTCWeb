var express = require('express');
var router = express.Router();
const { v4:uuidV4 } = require('uuid');
const Rooms = require('../models/Room');


/* GET home page. */
router.get('/join', (req, res) => {
  Rooms.find({})
    .then(rooms => {
      // console.log(rooms);
      rooms.forEach(room => {
        if(!room.users.length) {
          room.delete();
        }
      })
    })
  return res.render('join');
})

router.post('/join', (req, res) => {
  var username = req.body.username;
  var roomId = req.body.roomId;
  
  Rooms.findOne({roomId: roomId})
    .then(room => {
      if(!room) {
        return res.render('join', {msg: `This room doesn't exist`});
      }
      else {
        Rooms.findOneAndUpdate({roomId: req.body.roomId}, {$push: {users: username}}, () => {
          req.session.user = username;
          req.session.roomId = roomId;
          return res.redirect('/');
        })
      }
    })

});

router.get('/leave', (req, res) => {
  Rooms.findOneAndUpdate({roomId: req.session.roomId}, {$pull: {users: req.session.user}}, {}, () => {
    req.session.destroy();
    
    return res.redirect('/');
  })
  
})

router.get('/create', (req, res) => {
  
  return res.render('create');
})

router.post('/create', (req, res) => {
  req.session.roomId = uuidV4();
  
  Rooms.findOne({roomId: req.session.roomId})
  .then(room => {
    if(!room) {
      req.session.user = req.body.username;
      var newRoom = {
        roomId: req.session.roomId,
        users: [req.body.username]
      }
    
        new Rooms(newRoom).save();
        return res.redirect('/');
      }
      else {
        return res.redirect('/');
      }
    })
})

router.get('/', function(req, res, next) {
  if(!req.session.user) {
    return res.redirect('/join');
  }

  return res.redirect(`/${req.session.roomId}`);
});

router.get('/:room', (req, res) => {
  return res.render('room', {username: req.session.user, roomId: req.params.room });
})

module.exports = router;
