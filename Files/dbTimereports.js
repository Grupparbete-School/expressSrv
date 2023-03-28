const dotenv = require("dotenv").config();             
const {client, Client} = require("@notionhq/client");         

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id3 = process.env.TIMEREPORTS_DB;

module.exports = GetTimereports = async() => {
  
  const myDownload = {
 
    path: "databases/" + database_id3 + "/query",

    method: "POST",
  };

  const {results}=await notion.request(myDownload);
  
  const timereports = results.map((page)=>{

    return {
      PageId: page.id,
      ProjectId: page.properties.Project.relation,
      WorkedHours: page.properties.Hours.number,
      StartDate: page.properties.Date.date ? page.properties.Date.date.start: null,
      EndDate: page.properties.Date.date ? page.properties.Date.date.end: null,
      PersonId: page.properties.Person.relation,
      Url_comments: page.url,
    }
  });
  
  return timereports;
};