const dotenv = require("dotenv").config();                    
const {client, Client} = require("@notionhq/client");         
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const databaseTime = process.env.TIMEREPORTS_DB;

module.exports = GetTime = async() => {
  
  const myDownload = {
   
    path: "databases/" + databaseTime + "/query",
    method: "POST",
  };

  const {results}=await notion.request(myDownload);
  
  const time = results.map((page)=>{
    return {
      Projectid: page.properties.Project.relation[0].id,
      Hours: page.properties.number,
      WorkedHours: page.properties.Hours.number,
      StartDate: page.properties.Date.date ? page.properties.Date.date.start : null,
      EndDate: page.properties.Date.date ? page.properties.Date.date.start : null,
      PersonId: page.properties.Person.relation,
      Url_comments: page.url,
    }
  });
  return time;
};
