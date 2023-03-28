const dotenv = require("dotenv").config();                    
const {client, Client} = require("@notionhq/client");         
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const databasePeople = process.env.PEOPLE_DB;

module.exports = GetWork = async() => {
  
  const myDownload = {
   
    path: "databases/" + databasePeople + "/query",
    method: "POST",
  };

  const {results}=await notion.request(myDownload);
  
  const people = results.map((page)=>{
    return {
      TimeReportsId: page.properties.Timereports.relation,
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
