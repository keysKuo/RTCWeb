var express = require('express');
var router = express.Router();
const { v4:uuidV4 } = require('uuid');

/* GET home page. */
router.get('/join', (req, res) => {
  res.render('join');
})

router.post('/join', (req, res) => {
  var username = req.body.username;
  var roomId = req.body.roomId;

  req.session.user = username;
  req.session.roomId = roomId;

  res.redirect('/');
});

router.get('/', function(req, res, next) {
  if(!req.session.user) {
    return res.redirect('/join');
  }

  return res.redirect(`/${req.session.roomId}`);
});

router.get('/:room', (req, res) => {
  res.render('room', {username: req.session.user, roomId: req.params.room });
})

module.exports = router;
