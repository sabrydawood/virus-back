var supertest = require('supertest');
var express = require('express');
var app = express();
var session = require('express-session');
var back = require('../index');

/**
 * Express Test app
 */
app.set('trust proxy', 1) 
app.use(session({
secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null }
}));
app.use(back());

var handler = function(req, res) {
  res.end('test');
};

app.get('/', handler);
app.get('/one', handler);
app.get('/two', function(req, res) {
  res.back();
});

app.listen(8000);

var agent = supertest.agent(app);

describe('virus-back', function() {

  // get a session going
  before(function(done) {
    agent.get('/').expect(200, function(err, res) {
      if (err) return done(err);
      agent.saveCookies(res);
      done();
    });
  });

  it('should provide path tracking through sessions', function(done) {
    agent.get('/one').expect(200, function(err, res) {
      if (err) done(err);
      agent.get('/two')
        .expect('Location', '/one')
        .expect(302, done);
		//	console.log("done")
    });
  })
})