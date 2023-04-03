//Här "importerar" vi det som behövs för att köra vår server.
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

//skapar de variabler vi vill att alla "routes" ska ha tillgång till.
const encoded = process.env.SEC_ID_BASE64;
let userCode = "";
let userName = "";
let userEmailObj = "";
let accessToken = "";

//eftersom vår .env inte har en "port" så kör den på port 5000.
//Det innebär att när vi kör "npm start" så kommer vår server att köras localt på
//localhost:5000
//Detta får ni ändra om ni vill. kan t.ex stå 3001 eller nåt :D
const PORT = process.env.PORT || 5000;
const HOST = "localhost";

//Här "importerar" vi vår fil som innehåller funktionen som anropar på notion API för att hämta data.

const GetPeople = require("./Files/dbPeople"); //byta ut notion till rätt tabell från databasen
const GetProjects = require("./Files/dbProjects");
const GetTime = require("./Files/dbTimereports");

//Den här behövs så att vi ska kunna skicka data till vår frontend. Funkar inte annars!
app.use(cors());
/***************************************************/

//Här säger vi på vilken route datan ska visas.
app.get("/people", async (req, res) => {
  //Vi anropar funktionen GetWork och sparar resultatet (som är det filtrerade datan) i names.
  const names = await GetPeople();
  //Vi kör en json på datan vi fick
  res.json(names);
});

app.get("/projects", async (req, res) => {
  //Vi anropar funktionen GetWork och sparar resultatet (som är det filtrerade datan) i names.
  const names = await GetProjects();
  //Vi kör en json på datan vi fick
  res.json(names);
});

app.get("/time", async (req, res) => {
  //Vi anropar funktionen GetWork och sparar resultatet (som är det filtrerade datan) i names.
  const names = await GetTime();
  //Vi kör en json på datan vi fick
  res.json(names);
});

const authToken = process.env.NOTION_TOKEN;
const notion = new Client({ auth: authToken });

app.post("/AddComment", jsonParser, async (reg, res) => {
  const { Comment, pageId } = reg.body;
  console.log(Comment);

  const response = await notion.comments.create({
    parent: {
      page_id: pageId,
    },
    rich_text: [
      {
        text: {
          content: Comment,
        },
      },
    ],
  });
  console.log(response);
});

app.patch("/PatchComment", jsonParser, async (reg, res) => {
  const { Comment, pageId } = reg.body;

  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      Comments: {
        title: [
          {
            type: "text",
            text: {
              content: Comment,
            },
          },
        ],
      },
    },
  });

  console.log(response);
  console.log(pageId);
  console.log(Comment);
});

const database_id3 = process.env.TIMEREPORTS_DB;

app.post("/AddTime", jsonParser, async (req, res) => {
  const { hours, date, projectid, PersonId } = req.body;
  const Hours = parseInt(req.body.hours);
  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: database_id3,
    },
    properties: {
      Hours: {
        type: "number",
        number: Hours,
      },
      Date: {
        type: "date",
        date: {
          start: date,
        },
      },
      Project: {
        type: "relation",
        relation: [
          {
            id: projectid,
          },
        ],
      },
      Person: {
        type: "relation",
        relation: [
          {
            id: PersonId,
          },
        ],
      },
    },
  });
});

app.patch("/PatchChange", jsonParser, async (reg, res) => {
  const { Hours, PageIds } = reg.body;
  const hours = parseInt(reg.body.Hours);

  const page = await notion.pages.retrieve({
    page_id: PageIds,
  });

  console.log(page);

  const hours_property_id = page.properties["Hours"].id;

  console.log(hours_property_id);

  const response = await notion.pages.update({
    page_id: PageIds,
    properties: {
      [hours_property_id]: {
        number: hours,
      },
    },
  });
  //console.log(response)
});

//Changes status on projects
app.patch("/ChangeStatus", jsonParser, async (reg, res) => {
  const { status, pageId } = reg.body;

  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: {
        select: {
          name: status,
        },
      },
    },
  });
  console.log(response);
  console.log(status);
  console.log(pageId);
});

const projectID = process.env.PROJECTS_DB;

app.post("/CreateProject", jsonParser, async (reg, res) => {
  const { ProjectName, MaxHours, StartDate, EndDate, Status, Description } =
    reg.body;

  const hours = parseInt(MaxHours);

  const response = await notion.pages.create({
    
    parent: {
      type: "database_id",
      database_id: projectID,
    },
    properties: {
      Projectname: {
        title: [
          {
            text: {
              content: ProjectName,
            },
          },
        ],
      },
      Hours: {
        number: hours,
      },
      Timespan: {
        date: {
          start: StartDate,
          end: EndDate,
        },
      },
      Description: {
        rich_text: [
          {
            text: {
              content: Description,
            },
          },
        ],
      },
      Status: {
        select: {
          name: Status,
        },
      },
    },
  });
  console.log(MaxHours);
});

const peopleID = process.env.PEOPLE_DB;

app.post("/AddEmployee", jsonParser, async (reg, res) => {
  const { Name, Role, Email } = reg.body;

  const response = await notion.pages.create({

    parent: {
      type: "database_id",
      database_id: peopleID,
    },
    properties: {
      Email: {
        type: "email",
        email: Email,
      },
      Role: {
        type: "select",
        select: {
          name: Role,
          color: "default",
        },
      },
      Name: {
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: Name,
            },
          },
        ],
      },
    },
  });
  
});

//Hit skickas användaren efter att man godkänner inloggningen.
app.get("/authorize", async (req, res) => {
  //uniq kod som genereras sparas här. Behövs för att få token.
  userCode = req.query.code;
  console.log(req.query);
  //En variabel som innehåller objektet vi ska skicka till notion.
  //"Header" innehåller client_ID och Client_Secret (vilket är känsligt och bör sparas i .env)
  const requestToken = {
    method: "POST", //POST-request (begära data)
    headers: {
      Authorization: `Basic ${encoded}`, //Autentiserar oss
      "Content-Type": "application/json", //Vill få tillbaka json-data
    },
    body: JSON.stringify({
      grant_type: "authorization_code", //typ av begäran
      code: userCode, //Skickar temporära koden vi fick.
      redirect_uri: "http://localhost:5000/authorize", //hit skickas datan sen.
    }),
  };

  //Här skickar vi begäran till notion och sparar svaret i en variabel.
  const notionResponse = await fetch(
    "https://api.notion.com/v1/oauth/token",
    requestToken
  );
  console.log(notionResponse);

  //Vi omvandlar datan till en json.
  const data = await notionResponse.json();
  console.log(data);

  //Här hämtar vi datan vi behöver. Access_Token, användarnamn och mejladressen.
  //notera att mejladressen är ett objekt. För att få mejlet skriver vi .email efter
  //så som det står inuti console.log.
  accessToken = data.access_token;
  userName = data.owner.user.name;
  userEmailObj = data.owner.user.person;
  console.log(userEmailObj);
  console.log(userName + " " + userEmailObj.email + " " + accessToken);

  //Här kör vi funktionen som finns i "./Files/Notion.js"
  //Den hämtar all data inuti "PEOPLE"-databasen och sparar det i variabeln names.
  const names = await GetPeople();
  console.log(names);
  //Kör en find-metod för att kolla om mejladressen som finns inuti "names" liknar någon av
  //email-raderna i datan vi fick.
  //om det matchar så sparar vi relevant data inuti "role"-variabeln.
  //Den är tänkt att därefter skicka till frontend för att avgöra hur menyn ska se ut.
  let role = "";
  let name = "";
  let email = "";
  const match = names.find(
    (person) => person.Email.toLowerCase() === userEmailObj.email.toLowerCase()
  );
  if (match) {
    role = match.Role; //+ " " + match.Name + " " + match.Email
    name = match.Name;
    email = match.Email;
    console.log(role);
  } else {
    console.log("failed.");
  }

  //Hit skickas vi om allt går som planerat. (Ej korrekt egentligen då vi ska skapa en annan route
  //som ska kolla om användaren finns med i databasen eller ej.)
  res.redirect(
    `http://localhost:3000/dashbord?userRole=${role}&userName=${name}&userEmail=${email}`
  );
});

app.listen(PORT, HOST);
console.log(`Server is running on http://${HOST}:${PORT}`);

// console.log(btoa('clientID:secretID'))
