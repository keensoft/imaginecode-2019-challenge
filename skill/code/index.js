const Alexa = require('ask-sdk-core');
const request = require('request-promise-native');

/*
------------------------------
-    Custom task handlers    -
------------------------------
*/
// General levels
const GeneralLevelsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NivelesGeneralesIntent';
    },
    async handle(handlerInput) {
        const response = await request(prepareOptions("http://www.zaragoza.es/sede/servicio/informacion-polen"));
        const json = JSON.parse(response.body);
          
        var talkResult = "";
        const resultElements = json.result;  
        resultElements.forEach(element => {      
            talkResult += element.title + ":" + element.observation[0].value + ",";
        });
        
        return handlerInput.responseBuilder
            .speak(talkResult + '. ¿Puedo ayudarte en algo más?')
            .reprompt('¿Puedo ayudarte en algo más?')
            .getResponse();
    }
};

// By level
const NivelConcretoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NivelConcretoIntent';
    },
    async handle(handlerInput) {
        const response = await request(prepareOptions("http://www.zaragoza.es/sede/servicio/informacion-polen"));
        const json = JSON.parse(response.body);
          
        const level = handlerInput.requestEnvelope.request.intent.slots.level.value;
        var talkResultLevel = "";
        const resultElementsLevel = json.result;  
        resultElementsLevel.forEach(element => {      
            if(element.observation[0].value === level)     
                talkResultLevel += element.title + ",";
        });
        if(talkResultLevel === "")
            talkResultLevel = "No hay medidas de nivel '" + level + "'";
        
        return handlerInput.responseBuilder
            .speak(talkResultLevel + '. ¿Puedo ayudarte en algo más?')
            .reprompt('¿Puedo ayudarte en algo más?')
            .getResponse();
    }
};

/*
------------------------------
-    Common task handlers    -
------------------------------
*/
// Welcome 
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenido! ¿en qué puedo ayudarte?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
// Help 
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes solicitar los niveles generales o especificar un nivel. ¿En que puedo ayudarte?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
// Cancel and stop
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Gracias por usar este servicio. Hasta luego!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
// Error 
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Lo siento. Se ha producido un error. <lang xml:lang="en-GB">` + error.message + `</lang>`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/*
------------------------------
-     Utility functions      -
------------------------------
*/
// Prepare request params
function prepareOptions(url) {
  return {
    url: url,
    headers: {
      Accept: "application/json"
    },
    resolveWithFullResponse: true
  };
}

// Session end
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

/*
------------------------------------------
-     Skill builder - Order matters      -
------------------------------------------
*/
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        GeneralLevelsIntentHandler,
        NivelConcretoIntentHandler,
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
