//Här "importerar" vi det som behövs för att köra vår server.
const express = require("express");
const app= express();
const cors = require('cors');

//eftersom vår .env inte har en "port" så kör den på port 5000.
//Det innebär att när vi kör "npm run" så kommer vår server att köras localt på
//localhost:5000
//Detta får ni ändra om ni vill. kan t.ex stå 3001 eller nåt :D
const PORT = process.env.PORT || 5000;

//Här "importerar" vi vår fil som innehåller funktionen som anropar på notion API för att hämta data.
const GetWork = require('./Files/notion');

//Den här behövs så att vi ska kunna skicka data till vår frontend. Funkar inte annars!
app.use(cors())

//Här säger vi på vilken route datan ska visas.
app.get("/", async(req, res) =>{
    //Vi anropar funktionen GetWork och sparar resultatet (som är det filtrerade datan) i names.
    const names = await GetWork();
    //Vi kör en json på datan vi fick
    res.json(names);
});

app.listen(PORT);