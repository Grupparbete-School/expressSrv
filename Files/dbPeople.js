const dotenv = require("dotenv").config();                    //dotenv för att spara vår token och databas id i appens "Enviourment".
const {client, Client} = require("@notionhq/client");         //Ett js bibliotek som gör det lättare att koppla mot notion API

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id2 = process.env.PEOPLE_DB;

module.exports = GetPeople = async() => {
  
  const myDownload = {
    path: "databases/" + database_id2 + "/query",
    method: "POST",
  };

  const {results}=await notion.request(myDownload);
  
  const people = results.map((page)=>{
    
  let ids = []; 
  for (let i = 0; i < page.properties.Timereports.relation.length; i++)
  { ids.push(page.properties.Timereports.relation[i].id) }

    return {  
        peopleId: ids,
        PersonId: page.id,
        Name: page.properties.Name.title[0].text.content,
        Role: page.properties.Role.select.name,
        Email: page.properties.Email.email,
        WorkedHours: page.properties.TotalHours.rollup.number,
        Url: page.url,
    }
  });
  
  return people;
};