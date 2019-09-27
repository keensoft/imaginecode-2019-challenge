const request = require("request-promise-native");

handle();

// Task handler simulation
async function handle(handlerInput) {
  // Make request
  const r = await request(
    prepareOptions("http://www.zaragoza.es/sede/servicio/informacion-polen")
  );

  // Parse response
  const json = JSON.parse(r.body);

  // Do stuff with response
  console.log("---------------------------");
  console.log("|         Raw body        |");
  console.log("---------------------------");
  console.log(r.body);

  console.log("\n");
  console.log("---------------------------");
  console.log("|       Parsed JSON       |");
  console.log("---------------------------");
  console.log(json);

  console.log("\n");
  console.log("-------------------------------------");
  console.log("|    Extracted values - General     |");
  console.log("-------------------------------------");
  var talkResultGeneral = "";
  const resultElements = json.result;  
  resultElements.forEach(element => {      
      console.log(element.title);
      console.log("\t Observaciones: " + element.observation);
      console.log("\t Observaciones (texto): " + JSON.stringify(element.observation));
      console.log("\t Nivel: " + element.observation[0].value);     
      
      talkResultGeneral += element.title + ":" + element.observation[0].value + ",";
  });
  console.log("\nTalk result  - General: \n\t" + talkResultGeneral);

  console.log("\n");
  console.log("-------------------------------------");
  console.log("|    Extracted values - By level     |");
  console.log("-------------------------------------");
  const level = "bajo";
  var talkResultLevel = "";
  const resultElementsLevel = json.result;  
  resultElementsLevel.forEach(element => {      
    if(element.observation[0].value === level)     
      talkResultLevel += element.title + ",";
  });
  if(talkResultLevel === "")
    talkResultLevel = "No hay medidas de nivel '" + level + "'";
  console.log("\nTalk result  - By level: \n\t" + talkResultLevel);
}

// Utility function
function prepareOptions(url) {
  return {
    url: url,
    headers: {
      Accept: "application/json"
    },
    resolveWithFullResponse: true
  };
}
