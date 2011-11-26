var app = require('../app'),
	assert = require('assert'),
	models = require('../models/Card'),
	Card = models.Card,
	mongoose = require('mongoose');

describe('Card', function() {
	it('should save valid Cards', function(done) {
		var card = new Card({summary: 'SUMMARY', content: 'CONTENT', status: 'ready'});
		card.save(function(err) {
			if (err) throw err;
			done();
		});
	});
	
	it('should prevent summary from being blank', function(done) {
		var card = new Card({summary: '', content: 'CONTENT', status: 'ready'});
		card.save(function(err) {
			if (err) return done();
			assert.equals(1, 2);
		});
	});
	
	it('should prevent content from being blank', function(done) {
		var card = new Card({summary: 'SUMMARY', content: '', status: 'ready'});
		card.save(function(err) {
			if (err) return done();
			assert.equals(1, 2);
		});
	});
	
	it('should prevent status from being invalid', function(done) {
		var card = new Card({summary: 'SUMMARY', content: 'CONTENT', status: 'INVALID'});
		card.save(function(err) {
			if (err) return done();
			assert.equals(1, 2);
		});
	});
});
