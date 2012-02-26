var cardModel = require('../models/Card'),
    Card = cardModel.Card;

function _filterByStatus(cards, status) {
  return cards.filter(function(card) {
    return card.status === status;
  });
}

function _createErrorResponse(res) {
  return function(err) {
    if (err) {
      res.send(JSON.stringify({error: err}), 500);
    }
  };
}

exports.index = function(req, res) {
  var propagateError = _createErrorResponse(res);
  Card.find({}, function(err, cards) {
    propagateError(err);
    
    // Lazy bastard's Object clone
    var cardsinfo = JSON.parse(JSON.stringify(cardModel.statuses));
    
    // Populate cards for each status
    cardModel.statuses.forEach(function(statusObj, index) {
      var cardsByStatus = _filterByStatus(cards, statusObj.name);
      cardsinfo[index]['cards'] = cardsByStatus;
    });
    
    res.render('index', {
      cardsinfo: cardsinfo
    });
  });
};

exports.createCard = function(req, res) {
  var propagateError = _createErrorResponse(res);
  var card = new Card(req.body.card);
  card.save(propagateError);
  res.redirect('back');
};

exports.updateCard = function(req, res) {
  var propagateError = _createErrorResponse(res);
  Card.findOne({_id: req.params.id}, function(err, card) {
    propagateError(err);
    for (var prop in req.body) {
      card[prop] = req.body[prop];
    }
    
    card.save(propagateError);
    res.send(null, 200);
  });
};

exports.deleteCard = function(req, res) {
  res.redirect('back');
  // Your homework ;)
};