const dotenv = require("dotenv").config(); //dotenv för att spara vår token och databas id i appens "Enviourment".
const { client, Client } = require("@notionhq/client"); //Ett js bibliotek som gör det lättare att koppla mot notion API

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id3 = process.env.TIMEREPORTS_DB;

module.exports = GetTimeReports = async () => {
  // const test = await GetWork2();
  // console.log(test)

  const myDownload = {
    path: "databases/" + database_id3 + "/query",
    method: "POST",
  };
  const { results } = await notion.request(myDownload);
  const timeReports = results.map((page) => {
    
  const personId = page.properties.Person.relation.map((relation) => { return relation.id; });
    return {
       PageId: page.id,
       ProjectId: page.properties.Project.relation,
       WorkedHours: page.properties.Hours.number,
       StartDate: page.properties.Date.date ? page.properties.Date.date.start : null,
       EndDate: page.properties.Date.date ? page.properties.Date.date.end : null,
       PersonId: page.properties.Person.relation,
       Url_comments: page.url,
    };
  });
  return timeReports;
};
