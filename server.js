const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

let images = []; // { url, title, user }

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Homepage (public wall)
app.get('/', (req, res) => {
  res.render('wall', { images, user: req.session.user, filter: null });
});

// My wall
app.get('/my-wall', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const userImages = images.filter(img => img.user === req.session.user);
  res.render('wall', { images: userImages, user: req.session.user, filter: req.session.user });
});

// Login page
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  req.session.user = req.body.username;
  res.redirect('/');
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Upload form
app.get('/upload', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('upload', { user: req.session.user });
});

// Add image
app.post('/upload', (req, res) => {
  if (!req.session.user) return res.status(401).send("Login required");
  images.push({
    url: req.body.url,
    title: req.body.title || 'Untitled',
    user: req.session.user
  });
  res.redirect('/my-wall');
});

// Delete image
app.post('/delete', (req, res) => {
  if (!req.session.user) return res.status(401).send("Login required");
  images = images.filter(img => !(img.url === req.body.url && img.user === req.session.user));
  res.redirect('/my-wall');
});

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
