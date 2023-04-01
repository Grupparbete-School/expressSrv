const dotenv = require("dotenv").config();             
const {client, Client} = require("@notionhq/client");         

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id2 = process.env.PROJECTS_DB;

module.exports = GetProjects = async() => {
    const myDownload = {
      path: "databases/" + database_id2 + "/query",
      method: "POST",
  };

  const {results}=await notion.request(myDownload);
  
  const projects = results.map((page) => { 
    let ids = []; 
    for (let i = 0; i < page.properties.Timereports.relation.length; i++){ 
      ids.push(page.properties.Timereports.relation[i].id) 
    } 
      return { 
        PageId: page.id,
        ProjectName: page.properties.Projectname.title[0].text.content, 
        Description: page.properties.Description.rich_text[0].text.content, 
        Status: page.properties.Status.select.name,
        StatusColor: page.properties.Status.select.color,
        MaxHours: page.properties.Hours.number, 
        UsedHours: page.properties.WorkedHours.rollup.number, 
        HoursLeft: page.properties.HoursLeft.formula.number, 
        StartDate: page.properties.Timespan.date.start, 
        EndDate: page.properties.Timespan.date.end, 
        PersonId: ids,
      }; 
    });
  
  return projects;
};