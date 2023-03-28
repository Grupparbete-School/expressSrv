const dotenv = require("dotenv").config(); //dotenv för att spara vår token och databas id i appens "Enviourment".
const { client, Client } = require("@notionhq/client"); //Ett js bibliotek som gör det lättare att koppla mot notion API

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id = process.env.PROJECTS_DB;

module.exports = GetWork = async () => {

  const myDownload = {
    path: "databases/" + database_id + "/query",
    method: "POST",
  };
  const { results } = await notion.request(myDownload);
  const projects = results.map((page) => {
    
    let ids = []; 
    for (let i = 0; i < page.properties.Timereports.relation.length; i++)
    { ids.push(page.properties.Timereports.relation[i].id) }
    
    return {
      PageId: page.id,
      peopleId: ids,
      ProjectName: page.properties.Projectname.title[0].text.content,
      Description: page.properties.Description.rich_text[0].text.content,
      Status: page.properties.Status.select.name,
      MaxHours: page.properties.Hours.number,
      UsedHours: page.properties.WorkedHours.rollup.number,
      HoursLeft: page.properties.HoursLeft.formula.number,
      StartDate: page.properties.Timespan.date.start,
      EndDate: page.properties.Timespan.date.end,
    };
  });
  
  return projects;
};
