const express = require('express');
const cookieParser = require('cookie-parser');
const { getUserByEmail, generateRandomString } = require('./helper');

const app = express();
const PORT = 8080;

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  user1: {
    email: 'a@b.net',
    password: 'pipa',
  },
};

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

//    REGISTER

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const rndmId = generateRandomString();
  const user = `user${rndmId}`;
  const { email, password } = req.body;

  const userExists = getUserByEmail(email, users);
  if (userExists) {
    return res.status(400).send('Access denied');
  }

  if (password === '' || email === '') {
    res.status(400).send('Please provide email and password.');
  }

  users[user] = {
    email,
    password,
  };

  res.cookie('user_id', user);
  res.redirect('/urls');
});

//    NEW LOGIN

app.get('/login', (req, res) => {
  res.render('login');
});

//    LOGIN

// app.post('/login', (req, res) => {
//   res.redirect('/urls');
// });

//    LOGOUT

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//    URLS

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };

  res.render('urls_index', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
  };
  res.render('urls_show', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>Work</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}!`);
});
