const dotenv = require("dotenv").config();                    
const {client, Client} = require("@notionhq/client");         
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseProjects = process.env.PROJECTS_DB;

module.exports = GetProjects = async() => {
  
  const myDownload = {
   
    path: "databases/" + databaseProjects + "/query",
    method: "POST",
  };

  const {results}=await notion.request(myDownload);
  
  const projects = results.map((page)=>{
    return {
        TimeReportsId: page.properties.Timereports.relation,
        ProjectName: page.properties.Projectname.title[0].text.content,
        Description: page.properties.Description.rich_text[0].text.content, 
        Status: page.properties.Status.select.name,
        Maxhours: page.properties.Hours.number,
        UsedHours: page.properties.WorkedHours.rollup.number,
        WorkedHours: page.properties.WorkedHours.rollup.number,
        HoursLeft: page.properties.HoursLeft.formula.number,
        StartDate: page.properties.Timespan.date.start,
        EndDate: page.properties.Timespan.date.end,
        Id: page.id,
        PersonId: page.properties.Timereports.relation[0].id,
      }
  });
 
  return projects;
};