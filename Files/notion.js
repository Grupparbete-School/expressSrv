//Här har vi det som komponenten behöver för att fungera
const dotenv = require("dotenv").config();                    //dotenv för att spara vår token och databas id i appens "Enviourment".
const {client, Client} = require("@notionhq/client");         //Ett js bibliotek som gör det lättare att koppla mot notion API

//Här sprarar vi vår Token och vår databas id i const.
//Notera att dessa hämtas från vår env fil och ska ha samma namn!
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id = process.env.NOTION_DATABASE_ID;

//Det här är egentligen ett äldre sätt att exportera funktioner.
//Detta motsvarar "export default" som vi sett tidigare men ändrar vi detta
//så måste vi ändra det som står längst upp från "const och require" till "import".
//Men det är i princip samma sak.
module.exports = GetWork = async() => {
  
  const myDownload = {
    //Här är länken till vår databas där databas_id är den id vi 
    //hämtar från webbläsaren i notions databas
    path: "databases/" + database_id + "/query",

    //POST är metoden som används. Enligt notion doc så ska vi köra denna för att "hämta" data.
    method: "POST",
  };

  //Vi skickar en request till notion och sparar resultaten i en const.
  const {results}=await notion.request(myDownload);
  
  //Här kör vi en map på (eller typ att vi filtrerar) datan som vi fick som svar.
  const work = results.map((page)=>{
    //Return säger att det är detta resultat som ska returneras och sparas inuti "work"
    return {
        Name: page.properties.Name.title[0].text.content
        // Role: page.properties.Role.select.name,
        // Email: page.properties.Email.email
    }
  });
  //När vår funktion GetWork anropas så är det då det som finns inuti const work ovan som returneras.
  return work;
};