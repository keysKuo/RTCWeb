var express = require('express');
var router = express.Router();
const { v4:uuidV4 } = require('uuid');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect(`${ uuidV4() }`);
});

router.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
})

module.exports = router;
