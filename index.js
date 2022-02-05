const express = require('express');
const cookieparser = require("cookie-parser")
const app = express();
const axios = require('axios');

const port = 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// Styles
app.use("/assets", express.static(__dirname + "/assets"));
app.use(cookieparser())

// index page
app.get('/', function (req, res) {
  res.render('index');
});

// about page
app.get('/about', function (req, res) {
  res.render('about');
});

// Facts from api
app.get('/facts/cats', async function (req, res) {
  const fact = (await axios("https://catfact.ninja/fact")).data.fact
  res.render('facts/cats', {
    fact: fact
  })
})

// SLash commands manager
app.get("/manage",function (req,res) {
  if (req.cookies.token) {
    return res.redirect("/managecommands")
  } else {
    res.render('give_token')
  }
})

app.get("/setcookie",function(req,res){
  res.cookie("token",req.query.token).send("OK")
})

app.get("/deletecookie",function(req,res){
  res.clearCookie("token")
  res.send("OK")
})

// Manage slash commands
app.get('/managecommands', async function (req, res) {
  const token = req.cookies?req.cookies.token:""
  if (!token) return res.redirect("/manage")
    //get the bot id by using the token
    let id;
    try {
      id = (await axios({
        url: "https://discord.com/api/v9/oauth2/applications/@me",
        headers: {
          "Authorization": `Bot ${token}`,
          "Content-Type": "application/json"
        }
      })).data.id
    } catch (e) {
      console.log(e)
      return res.render('errors/404')
    }

    //get the bot's slash commands
    const slash_commands = (await axios({
      url: `https://discordapp.com/api/v9/applications/${id}/commands`,
      headers: {
        "Authorization": `Bot ${token}`,
        "Content-Type": "application/json"
      }
    })).data
    return res.render('manage', {
      id: id,
      token: token,
      commands: slash_commands
    })
})

app.get('*', function (req, res) {
  res.status(404).render('errors/404')
});

app.listen(port);
console.log(`Server is running on port ${port}\nhttp://localhost:${port}`);