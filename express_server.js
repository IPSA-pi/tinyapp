const express = require('express');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

// Setup server
const app = express();
const PORT = 8080;

// Js consts and functions
const { getUserByEmail, generateRandomString } = require('./helper');

const urlDatabase = {
  // eslint-disable-next-line quote-props
  'b2xVn2': {
    url_id: 'b2xVn2',
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user1',
  },
  '9sm5xK': {
    url_id: '9sm5xK',
    longURL: 'http://www.google.com',
    userID: 'user2',
  },
};

const users = {
  // user1: {
  //   userID: 'user1',
  //   email: 'a@b.net',
  //   password: 'pipa',
  // },
  // user2: {
  //   userID: 'user2',
  //   email: 'b@b.net',
  //   password: 'popa',
  // },
};

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'user_id',
  keys: ['a0afaea5-9f29-45c5-bb9a-e69c13e87345', '0b63a547-6727-4879-b80d-3db65a3393df'],
  maxAge: 24 * 60 * 60 * 1000,
}));

//
// 🛣️🛣️🛣️ ROUTES 🛣️🛣️🛣️🛣️
//

//    REGISTER
//  Render register view
app.get('/register', (req, res) => {
  const userLoggedIn = req.session.user_id;
  if (!userLoggedIn) {
    return res.render('register');
  }
  return res.redirect('/urls');
});

// Create a new user and add to the users database.
app.post('/register', (req, res) => {
  const rndmId = generateRandomString();
  const user = `user${rndmId}`;
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userExists = getUserByEmail(email, users);

  if (password === '' || email === '') {
    return res.status(400).send('Please provide email and password.');
  }
  if (userExists) {
    return res.status(400).send('User already exists');
  }

  users[user] = {
    userID: user,
    email,
    hashedPassword,
  };

  req.session.user_id = user;
  return res.redirect('/urls');
});

//    LOGIN
// Render login view
app.get('/login', (req, res) => {
  const userLoggedIn = req.session.user_id;
  if (!userLoggedIn) {
    return res.render('login');
  }
  return res.redirect('/urls');
});

// handle user login
app.post('/login', (req, res) => {
  const { email, formPassword } = req.body;
  const userExists = getUserByEmail(email, users);

  // handle user not providing email and/or password
  if (email === '' || formPassword === '') {
    return res.status(403).send('Please provide credentials');
  }
  // handle if email doesn't matches user
  if (!userExists) {
    return res.status(403).send('Invalid credentials');
  }
  // verify hashed password
  if (!bcrypt.compareSync(formPassword, userExists.hashedPassword)) {
    return res.status(403).send('Incorrect password');
  }
  // set session cookie
  req.session.user_id = userExists.userID;
  return res.redirect('/urls');
});

//    LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//    URLS
// Render urls view according to user logged in
app.get('/urls', (req, res) => {
  const userLoggedIn = req.session.user_id;
  if (!userLoggedIn) {
    return res.send('Please login or register to view urls.');
  }

  // filter db to get only urls created by userLoggedIn
  const urlsForUser = (id) => {
    userURLs = {};
    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === id) {
        userURLs[url] = urlDatabase[url];
      }
    }
    return userURLs;
  };

  const templateVars = {
    urls: urlsForUser(userLoggedIn),
    user: users[req.session.user_id],
    email: users[req.session.user_id].email,
  };
  return res.render('urls_index', templateVars);
});

// redirect to longUrl using short URL
app.get('/u/:id', (req, res) => {
  const { longURL } = urlDatabase[req.params.id];
  if (longURL === undefined) {
    res.send('invalid url');
  }
  res.redirect(longURL);
});

// handle new short URL generation
app.post('/urls', (req, res) => {
  const userLoggedIn = req.session.user_id;
  if (!userLoggedIn) {
    return res.redirect('/login');
  }

  const { formLongURL } = req.body;
  const id = generateRandomString();

  urlDatabase[id] = {};
  urlDatabase[id].url_id = id;
  urlDatabase[id].longURL = formLongURL;
  urlDatabase[id].userID = userLoggedIn;

  return res.redirect(`/urls/${id}`);
});

// handle url update
app.post('/urls/:id/update', (req, res) => {
  const userLoggedIn = req.session.user_id;
  const { id } = req.params;

  if (!urlDatabase[id]) {
    return res.status(404).send('id not found');
  }

  if (!userLoggedIn) {
    return res.send('Please login or register to view urls.');
  }

  if (userLoggedIn !== urlDatabase[id].userID) {
    return res.status(403).send('You do not have permission to delete this url');
  }
  urlDatabase[id].longURL = req.body.update;
  return res.redirect('/urls');
});

// handle delete url
app.post('/urls/:id/delete', (req, res) => {
  const userLoggedIn = req.session.user_id;
  const { id } = req.params;

  if (!userLoggedIn) {
    return res.send('Please login or register to view urls.');
  }

  if (userLoggedIn !== urlDatabase[id].userID) {
    return res.status(403).send('You do not have permission to delete this url');
  }
  delete urlDatabase[id];
  return res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const userLoggedIn = req.session.user_id;
  if (!userLoggedIn) {
    res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id],
    email: users[req.session.user_id].email,
  };
  res.render('urls_new', templateVars);
});

// render specified url
app.get('/urls/:id', (req, res) => {
  const userLoggedIn = req.session.user_id;
  const { id } = req.params;

  if (!userLoggedIn) {
    return res.send('Please login or register to view urls.');
  }

  if (userLoggedIn !== urlDatabase[id].userID) {
    return res.send('You do not have permission to view this url');
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
    email: users[req.session.user_id].email,
  };
  return res.render('urls_show', templateVars);
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
