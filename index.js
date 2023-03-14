//Här "importerar" vi det som behövs för att köra vår server.
const express = require("express");
const app= express();
const cors = require('cors');
require('dotenv').config();
const { Client } = require('@notionhq/client');

//skapar de variabler vi vill att alla "routes" ska ha tillgång till.
const encoded = process.env.SEC_ID_BASE64
let userCode = "";
let userName = "";
let userEmailObj = "";
let accessToken = "";

//eftersom vår .env inte har en "port" så kör den på port 5000.
//Det innebär att när vi kör "npm start" så kommer vår server att köras localt på
//localhost:5000
//Detta får ni ändra om ni vill. kan t.ex stå 3001 eller nåt :D
const PORT = process.env.PORT || 5000;

//Här "importerar" vi vår fil som innehåller funktionen som anropar på notion API för att hämta data.
const GetWork = require('./Files/notion');

//Den här behövs så att vi ska kunna skicka data till vår frontend. Funkar inte annars!
app.use(cors())
/***************************************************/


//Här säger vi på vilken route datan ska visas.
app.get("/", async(req, res) =>{
    //Vi anropar funktionen GetWork och sparar resultatet (som är det filtrerade datan) i names.
    const names = await GetWork();
    //Vi kör en json på datan vi fick
    res.json(names);
});

//Hit skickas användaren efter att man godkänner inloggningen.
app.get("/authorize", async (req, res) => {

    //uniq kod som genereras sparas här. Behövs för att få token.
    userCode = req.query.code
    console.log(req.query)
    //En variabel som innehåller objektet vi ska skicka till notion.
    //"Header" innehåller client_ID och Client_Secret (vilket är känsligt och bör sparas i .env)
    const requestToken = {
        method: "POST", //POST-request (begära data)
        headers: {
          "Authorization": `Basic ${encoded}`,               //Autentiserar oss
          "Content-Type": "application/json",                //Vill få tillbaka json-data
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',                 //typ av begäran
          code: userCode,                                   //Skickar temporara koden vi fick.
          redirect_uri: 'http://localhost:5000/authorize',  //hit skickas datan sen.
        })
      }
  
      //Här skickar vi begäran till notion och sparar svaret i en variabel.
      const notionResponse = await fetch('https://api.notion.com/v1/oauth/token', requestToken);
      console.log(notionResponse)

      //Vi omvandlar datan till en json.
      const data = await notionResponse.json();
      console.log(data)

      //Här hämtar vi datan vi behöver. Access_Token, användarnamn och mejladressen.
      //notera att mejladressen är ett objekt. För att få mejlet skriver vi .email efter
      //så som det står inuti console.log.
      accessToken = data.access_token;
      userName = data.owner.user.name;
      userEmailObj = data.owner.user.person;
      console.log(userEmailObj)
      console.log(userName + " " + userEmailObj.email + " " + accessToken);

      //Här kör vi funktionen som finns i "./Files/Notion.js"
      //Den hämtar all data inuti "PEOPLE"-databasen och sparar det i variabeln names.
      const names = await GetWork();
      console.log(names)
      //Kör en find-metod för att kolla om mejladressen som finns inuti "names" liknar någon av 
      //email-raderna i datan vi fick.
      //om det matchar så sparar vi relevant data inuti "role"-variabeln.
      //Den är tänkt att därefter skicka till frontend för att avgöra hur menyn ska se ut.
      let role = "";
      const match = names.find(person => person.Email.toLowerCase() === userEmailObj.email.toLowerCase())
      if(match){
        role = match.Role; //+ " " + match.Name + " " + match.Email
        console.log(role);
      } else {
        console.log("failed.")
      }

      //Hit skickas vi om allt går som planerat. (Ej korrekt egentligen då vi ska skapa en annan route
      //som ska kolla om användaren finns med i databasen eller ej.)
      res.send(role + " " + userName);
  });

app.listen(PORT);