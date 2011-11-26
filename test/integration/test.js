var zombie = require('zombie'),
	assert = require('assert'),
	Subject = require('../../models/subject').Subject;

zombie.visit('http://localhost:3000', {debug: true}, createSubject);

function waitAndExec(nextFn) {
	return function(err, browser) { 
		browser.wait(nextFn);
	}
}

function createCard(err, browser) {
	browser.fill('.new-story input[type="text"]', 'SUMMARY');
	browser.fill('.new-story textarea', 'CONTENT');
	browser.pressButton('New Card', waitAndExec(updateText));
}

function focusSummary(err, browser) {
	browser.fire('focus', browser.querySelector('.card:last-child .card-title'), updateSummary);
}

function updateSummary(err, browser) {
	browser.fill('.card:last-child .card-title', 'UPDATED SUMMARY');
	browser.wait(focusContent);
}

function focusContent(err, browser) {
	browser.fire('focus', browser.querySelector('.card:last-child .content'), updateSummary);
}

function updateContent(err, browser) {
	browser.fill('.card:last-child .content', 'UPDATED CONTENT');
}