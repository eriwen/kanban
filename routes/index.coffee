cardModel = require("../models/Card")
Card = cardModel.Card

_filterByStatus = (cards, status) ->
  cards.filter (card) ->
    card.status is status

_createErrorResponse = (res) ->
  (err) ->
    res.send JSON.stringify(error: err), 500  if err

exports.index = (req, res) ->
  propagateError = _createErrorResponse(res)
  Card.find {}, (err, cards) ->
    propagateError err

    # Lazy bastard's Object clone
    cardsinfo = JSON.parse(JSON.stringify(cardModel.statuses))

    # Populate cards for each status
    cardModel.statuses.forEach (statusObj, index) ->
      cardsByStatus = _filterByStatus(cards, statusObj.name)
      cardsinfo[index]["cards"] = cardsByStatus

    res.render "index",
      cardsinfo: cardsinfo

exports.createCard = (req, res) ->
  propagateError = _createErrorResponse(res)
  card = new Card(req.body.card)
  card.save propagateError
  res.redirect "back"

exports.updateCard = (req, res) ->
  propagateError = _createErrorResponse(res)
  Card.findOne
    _id: req.params.id, (err, card) ->
      propagateError err
      for prop of req.body
        card[prop] = req.body[prop]
      card.save propagateError
      res.send null, 200

exports.deleteCard = (req, res) ->
  res.redirect "back"
  # Your homework ;)
