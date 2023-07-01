const express = require('express');
const cookieParser = require('cookie-parser');

// Setup server
const app = express();
const PORT = 8080;

// Js consts and functions
const { getUserByEmail, generateRandomString } = require('./helper');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  user1: {
    userID: 'user1',
    email: 'a@b.net',
    password: 'pipa',
  },
  user2: {
    userID: 'user2',
    email: 'b@b.net',
    password: 'popa',
  },
};

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//
// 🛣️🛣️🛣️ ROUTES 🛣️🛣️🛣️🛣️
//

//    URLS

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
    email: users[req.cookies.user_id].email,
  };

  res.render('urls_index', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

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

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    email: users[req.cookies.user_id].email,
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
    email: users[req.cookies.user_id].email,
  };
  res.render('urls_show', templateVars);
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

  if (password === '' || email === '') {
    res.status(400).send('Please provide email and password.');
  }
  if (userExists) {
    res.status(400).send('User already exists');
  }

  users[user] = {
    userID: user,
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

app.post('/login', (req, res) => {
  const { email, formPassword } = req.body;
  const userExists = getUserByEmail(email, users);

  // handle user not providing email and/or password
  if (email === '' || formPassword === '') {
    res.status(403).send('Please provide credentials');
  }
  // handle if email doesn't matches user
  if (!userExists) {
    res.status(403).send('Invalid credentials');
  }

  if (formPassword !== userExists.password) {
    res.status(403).send('Incorrect password');
  }

  res.cookie('user_id', userExists.userID);
  res.redirect('/urls');
});

//    LOGOUT
// :( the cookie is not being removed after redirect to /login
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// EXTRA ROUTES

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>Work</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}!`);
});
