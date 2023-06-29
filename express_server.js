const express = require('express');

const app = express();
const PORT = 8080;
const { generateRandomString } = require('./scripts/generateRandomString');

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.use(express.urlencoded({ extended: true }));

//
app.post('/urls', (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/update', (req, res) => {
  const { id } = req.params;
  urlDatabase[id] = req.body.update;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const user = req.body.username;
  res.cookie('username', user);
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/', (req, res) => {
  console.log(urlDatabase.b2xVn2);
  res.send('Hello');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>Work</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}!`);
});
