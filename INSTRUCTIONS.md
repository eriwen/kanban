# Extreme NodeJS Development

## Agenda

 - 30 minute introduction to the technologies we'll be using
 - 60 minutes of project setup and coding together
   During this time, there will be helpers available to keep you on track
 - 15 minute break
 - 45 minutes of moar coding together
   Helpers available here, too
 - 35 minutes of independent coding
   Eric will be around helping people finish up their projects
 - 10 minutes of next steps, and, possibly unicorns

## Step 0: Prerequisites

Before we start coding, we need to get a few things setup and running. 

NOTE: I prefer that you use your own laptop for this, as you'll be in an environment you're familiar with. However, if you 
have a Windows laptop and have NOT already installed NodeJS, npm, and MongoDB, I recommend that you use one of the provided 
iMac stations as the setup may jeopardize your ability to follow along with the workshop.

ANOTHER NOTE: You'll probably want to tell your editor to "Show Invisibles" or "Show Whitespace", since Jade and Stylus are
whitespace-significant languages. 

### NodeJS

If you're on a Mac, you can install NodeJS through Homebrew or Macports:

    brew install node
    port install node

Detailed instructions for installing node are at: [https://github.com/joyent/node/wiki/Installation](https://github.com/joyent/node/wiki/Installation)

NOTE: Windows users may want to make sure they're on node version 0.6 or higher:

    node -v

### npm

Detailed installation instructions for npm are at: [https://github.com/isaacs/npm](https://github.com/isaacs/npm)

NOTE: Make sure you're on version 1.0 or higher. Also, if you just installed node v0.6.3, you have npm already!

### MongoDB

Grab the latest package for your system at: [http://www.mongodb.org/downloads](http://www.mongodb.org/downloads)

## Step 1: Project Setup

NOTE: If you're having trouble, there is a kickstart project available on GitHub at: 

    mkdir kanban-board
    cd !$
    npm install express -g
    express -c stylus
    npm install

This will get you setup with a skeleton app you can run immediately with:

    node app.js

And then point to `http://localhost:3000` in your favorite browser.

It should look like this:

[picture here]

Source doesn't get written without tests, so let's use the new hotness, Mocha:

   npm install mocha

We'll want to install mongoose, a MongoDB ODM:

   npm install mongoose

Create a directory where MongoDB can store it's data:

   mkdir -p /data/db

And start it up:

   mongod --dbpath /data/db &

Ok, we're ready! Let's write some JavaScript!

## Step 2: Writing the Kanban Board View

Your directory structure will look like this:

├── app.js _Your app server code_
├── node_modules _Where third-party modules are installed_
│   ├── express
│   ├── jade
│   ├── mocha
│   ├── mongoose
│   └── stylus
├── package.json _App details for installation later_
├── public _Directory where your client-facing code resides "/"_
│   ├── images
│   ├── javascripts _Client-side JS like jQuery goes here_
│   └── stylesheets _Stylus .styl files_
├── routes
│   └── index.js _JS relevant to view routing and mongo handling_
└── views
    ├── index.jade _Our main view code_
    └── layout.jade _Layout used by all other Jade files_

We want to keep our styles consistent across browsers, so we're going to use
normalize.css with stylus style!

Copy the raw source of https://gist.github.com/1391529 to `$project-dir/public/stylesheets/normalize.styl`

Stylus will automatically retranspile .styl files to CSS when you change them!

Now, pull down jQuery:

    cd public/javascripts
    wget http://code.jquery.com/jquery-1.7.1.js
    wget http://code.jquery.com/jquery-1.7.1.min.js

And create our main.js file there, too:

    touch main.js

Let's code up the layout. Replace everything in layout.jade with this:

    !!! 5
    html
      head
        meta(charset='utf-8')
        meta(http-equiv='X-UA-Compatible', content='IE=edge,chrome=1')
        title Simple Kanban
        link(rel='stylesheet', href='/stylesheets/normalize.css')
        link(rel='stylesheet', href='/stylesheets/style.css')
      body
        != body
        - if (this.development)
          script(src='/javascripts/jquery-1.7.1.js')
        - else
          script(src='/javascripts/jquery-1.7.1.min.js')
        script(src='/javascripts/main.js')

Express has automatically created a route for the home page, your `routes/index.js` file should look like this:

    /*
     * GET home page.
     */
    
    exports.index = function(req, res){
      res.render('index', { title: 'Express' })
    };

We'll be writing our tests first before updating our route. Add `test/routes.js` with:

    var routes = require('../routes'),
        assert = require('assert'),
        http = require('http');
    
    describe("Router", function() {
      describe('GET /', function() {
        it('should respond successfully with HTML', function() {
          http.get({path: '/', port: 3000}, function(res) {
            assert(res.ok);
            done();
          });
        });
      });
    });

Let's tell it to pass a list of card statuses instead of a title:

    exports.index = function(req, res) {
      res.render('index', { cardsinfo: [
          {name: 'ready', title: 'Ready'},
          {name: 'working', title: 'Working'},
          {name: 'review', title: 'In Review'},
          {name: 'deployed', title: 'Deployed'}
        ]
      });
    };

We'll need to write the home page to show a simple column-based kanban board.

Create a table with table headers for each step in your process and then just one row with table cells that will contain
our card lists. Use an `each` construct in Jade. If you get stuck, take a look at the finished project 
at [http://git.io/kanban](http://git.io/kanban) or ask a helper.

## Step 3: Creating Cards in MongoDB

Let's write a mocha test for our model in `test/models.js`:

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

And give it a quick run to make sure they fails spectacularly:

    mocha

We'll need a model to represent a Kanban Card, so put this into `models/Card.js`:

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
    
      // We could make this another model if we want
      availableStatuses = [
        {name: 'ready', title: 'Ready'},
        {name: 'working', title: 'Working'},
        {name: 'review', title: 'In Review'},
        {name: 'deployed', title: 'Deployed'}
      ],
      Card = new Schema({
        // YOUR TURN: fill in the schema with things you think should be part of a story Card. Don't forget to validate and update tests if necessary!
      });
    
    mongoose.connect('mongodb://localhost/kanban');
    exports.Card = mongoose.model('Card', Card);
    exports.statuses = availableStatuses;

Now we need a route to handle creating and showing Cards. TEST FIRST in `test/routes.js`:

    describe('POST /', function() {
      it('should redirect back from creating a new Card', function() {
        var postData = JSON.stringify({'card[summary]': 'SUMMARY', 'card[content]': 'CONTENT', 'card[status]': 'working'});
        var postReq = http.request({method: 'POST', path: '/', port: 3000}, function(res) {
          assert.equal(res.statusCode, 302);
          done();
        });
        postReq.write(postData);
        postReq.end();
      });
    });

Add this to `routes/index.js`:

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

        res.render('index', { cardsinfo: cardsinfo });
      });
    };
    
    exports.createCard = function(req, res) {
      var card = new Card(req.body.card);
      // YOUR TURN: save the new card to MongoDB
      res.redirect('back');
    };

We'll also need a form on our home page to create Cards. Add this to the top of `views/index.jade`:

    form.new-story(method='post', action='/')
      input(type='hidden', name='card[status]', value='ready')
      input(type='submit', value='New Card')
      input(type='text', name='card[summary]')
      textarea(name='card[content]')

Finally, we need to add some styles to make it look hawt! Add this to `public/stylesheets/style.styl`:

    // Mixins
    vendor(prop, args)
      -webkit-{prop} args
      -moz-{prop} args
      {prop} args
    
    border-radius()
      vendor('border-radius', arguments)
    
    box-shadow()
      vendor('box-shadow', arguments)
    
    transition()
      vendor('transition', arguments)
    
    card_style_for_color($color)
      background-color $color
      border: 2px solid darken($color, 20%);
    
    // Variables
    max-width = 960px
    blocked-color = #FF0000
    highlight-color = #D0E86C
    ready-color = #C378FF
    working-color = #FF809E
    review-color = #FFAE63
    deployed-color = #62F0B4
    
    // Board Styles
    body
      font 20px helvetica, arial, sans-serif
      color #333
      margin 10px auto
      max-width max-width
    
    .clear
      clear both
    
    .board-table
      font-size 24px
      margin 10px 0
      table-layout fixed
      width 100%
      
      & th
        font-weight bold
        width 20%
      & td, & th
        border 1px dashed #999
        border-width 0 1px
    
    // Card styles
    .cards
      margin 0
      min-height 400px
      padding 10px 5px
    
    .card
      border-radius(7px)
      color #333
      list-style none
      margin-bottom 5px
    
    .card-title
      border-bottom 1px solid #333
      font-weight bold
      text-align center
    
    .blocked
      card_style_for_color(blocked-color)
    .highlight
      card_style_for_color(highlight-color)
    .ready
      card_style_for_color(ready-color)
    .working
      card_style_for_color(working-color)
    .review
      card_style_for_color(review-color)
    .deployed
      card_style_for_color(deployed-color)
    
    // New Card Form
    .new-story
      background-color #DDD
      border-radius(7px)
      padding 7px 5px 7px 8px
      margin 20px 0
    
      & input[type=text]
        width 80%
        height 34px
        font-size 20px
        margin-bottom 5px
        vertical-align bottom
      
      & textarea
        width 80%
        height 80px
        vertical-align bottom
    
      & input[type=submit]
        float right
        width 18%
        height 125px
        margin 3px 5px
        font-size 20px


You'll need to restart the app to see changes to routes. Then hit `http://localhost:3000` and try it out!

## Step 4: Modifying Cards and Flashiness

Now that we can create cards, we should allow them to be modified. Because we love HTML5 here at 
The Rich Web Experience, we're going to add 'contenteditable="true"' and data attributes to our
card content and attach events to update them in the background. This'll also be where jQuery
helps us develop a bit faster. 

Update the Kanban card `table` in `views/index.jade` to:

    table.board-table
      thead
        tr
          - each cardtype in cardsinfo
            th(class=cardtype.name) #{cardtype.title}
      tbody
        tr
          - each cardtype in cardsinfo
            td
              ul.cards(data-status=cardtype.name)
                - each card in cardtype.cards
                  li.card(class=card.status, data-id=card._id) 
                    div.card-title(data-rel='summary', contenteditable='true') #{card.summary}
                    div.content(data-rel='content', contenteditable='true') #{card.content}

We'll need a route to update the card in `routes/index.js`:

    exports.updateCard = function(req, res) {
      var propagateError = _createErrorResponse(res);
      Card.findOne({_id: req.params.id}, function(err, card) {
        // YOUR TURN: update the card and "save" it
      });
    };

Now we'll need to write the client side JS in `public/javascripts/main.js`:

    function init() {
      $('.card>.card-title').bind('change', updateText);
      $('.card>.content').bind('change', updateText);
      $('[contenteditable]').bind('focus', inlineFocus).bind('blur paste', inlineBlur);
      $('[contenteditable]').mousedown(function(){ this.focus(); });
    }
    
    function inlineFocus() {
      // YOUR TURN: Set data-before to the current text so we can revert
    }
    
    function inlineBlur() {
      // YOUR TURN: If text is not the same as in data-before fire "change" event
    }
    
    function updateText() {
      // YOUR TURN: POST to /(Card ID) with Ajax
    }

One more restart and try updating cards by clicking in the card and just updating the text. Cool, huh?

Now all we have to do is allow the status to be changed. Let's allow our cards to be dragged to any status and
updated in the background. For this, we'll need jquery-ui with the sortable widget to make this a painless
addition.

This one's all on you. You know you'll have to download jquery-ui and include it along with jquery, then POST
to `/(Card ID)` when a card is dropped on another list with a new status. You should be able to reuse `routes.updateCard()`
to have changes sync'd with MongoDB. 

Remember, if you get stuck, you can cheat and grab the project from [http://git.io/kanban](http://git.io/kanban), ask
a helper, or even pair program a little with someone near you.

## Step 5: Next Steps

Congratulations! You built a decent web application _from scratch_ in less than 3 hours! 

If you are done early, here are some things you might consider:

 - Allow cards to be deleted or archived
 - Add card numbers
 - Add assigned users
 - Create or use a GitHub account and show off your mad NodeJS skillz
 - Provision a no.de SmartMachine at [http://no.de](http://no.de) and push your app there to use!

I hope you had fun and learned a lot! Feel free to tweet [@eriwen](http://twitter.com/eriwen) or
email me (emwendelin at gmail) questions, comments or perhaps a link to your project!