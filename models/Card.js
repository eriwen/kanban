var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
  availableStatuses = [
    {name: 'ready', title: 'Ready'},
    {name: 'working', title: 'Working'},
    {name: 'review', title: 'In Review'},
    {name: 'deployed', title: 'Deployed'}
  ],
  Card = new Schema({
    number: Schema.ObjectId,
    summary: {type: String, validate: /.+/},
    content: {type: String, validate: /.+/},
    status: {type: String, enum: ['ready', 'working', 'review', 'deployed'] } 
  });

mongoose.connect('mongodb://localhost/kanban');
exports.Card = mongoose.model('Card', Card);
exports.statuses = availableStatuses;
