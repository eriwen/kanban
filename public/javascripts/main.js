function init() {
  $('.card>.card-title').bind('change', updateText);
  $('.card>.content').bind('change', updateText);
  $('[contenteditable]').bind('focus', inlineFocus).bind('blur paste', inlineBlur);
  $('[contenteditable]').mousedown(function(){ this.focus(); });
  $('.cards').sortable({
    receive: updateStatus,
    connectWith: '.cards',
    delay: 50,
    items: 'li',
    opacity: 0.8
  });
}

function inlineFocus() {
  var cardAttribute = $(this);
  cardAttribute.data('before', cardAttribute.html());
  return cardAttribute;
}

function inlineBlur() {
  var cardAttribute = $(this);
  if (cardAttribute.data('before') !== cardAttribute.html()) {
    cardAttribute.data('before', cardAttribute.html());
    cardAttribute.trigger('change');
  }
  return cardAttribute;
}

function updateText() {
  var cardAttribute = $(this),
    data = {};
  data[cardAttribute.data('rel')] = cardAttribute.text();
  $.ajax({
    type: 'POST',
    url: '/' + cardAttribute.parent().data('id'),
    data: data,
    dataType: 'json'
  });
}

function updateStatus(evt, ui) {
  var cardColumn = $(this),
    card = ui.item,
    newStatus = cardColumn.data('status');
  $.ajax({
    type: 'POST',
    url: '/' + card.data('id'),
    data: {status: newStatus},
    dataType: 'json',
    success: function() {
      card.removeClass().addClass(newStatus).addClass('card')
    }
  });
}

$(init);
