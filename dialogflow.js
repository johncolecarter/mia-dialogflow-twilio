const dialogflow = require('@google-cloud/dialogflow');
const { request, response } = require('express');
const uuid = require('uuid');
const axios = require('axios');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

async function runSample(projectId = 'project-mia-260217') {
    // A unique identifier for the given session
    const sessionId = uuid.v4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: 'hot tub',
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }

    headers = {
        "Cashe-Control": "no cache",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep alive",
        "Accept": "*/*"
    }

    try {
        await axios.post('https://digital-human.dev.quext.io/api/v1/fulfillment', {
            responseId: responses[0].responseId,
            session: request.session,
            queryResult: {
                "queryText": result.queryText,
                "parameters": {
                    "param-name": ""
                },
                "allRequiredParamsPresent": true,
                "fulfillmentText": result.response,
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                result.response
                            ]
                        }
                    }
                ],
                "outputContexts": [
                    {
                        "name": responses[0].queryResult.outputContexts[0].name,
                        "lifespanCount": 5,
                        "parameters": {
                            "param-name": ""
                        }
                    }
                ],
                "intent": {
                    "name": responses[0].queryResult.intent.name,
                    "displayName": responses[0].queryResult.intent.displayName
                },
                "intentDetectionConfidence": 1,
                "diagnosticInfo": {},
                "languageCode": "en"
            },
            originalDetectIntentRequest: {}
        }, {
            headers: headers
        }).then((response) => {

            defaultData = response.data.fulfillmentText
            data = response.data.fulfillmentMessages

            if (typeof response.data.fulfillmentText === 'string') {
                console.log(defaultData)
            } else {
                imagesMaxNumber = data.length - 2
                maxNumber = getRandomInt(imagesMaxNumber)

                if (imagesMaxNumber != 0) {
                    console.log(data[maxNumber].card.imageUri)
                    console.log(data[data.length - 1].text.text[0])
                }
                // else {
                //     console.log(data[data.length - 1].text)
                //     console.log(data[data.length - 1].text.text[0])
                // }
            }
        })
    } catch (err) {
        console.log(err)
    }

    // responseId: responses[0].responseId,
    // session: request.session,
    // queryResult: responses[0].queryResult,
    // originalDetectIntentRequest: {}

    // axios.get(`http://localhost:3000/api/v1/community/98fb8529-7a06-4398-961d-7696b872bb82/intent/${result.intent.displayName}/response`).then(response => {
    //     let array = response.data.communityIntentUsesGlobalIntentResponse;

    //     let newArray = [];

    //     for (let i = 0; i < array.length; i++) {
    //         let active = array[i].is_active

    //         if (active === 1) {
    //             newArray.push(array[i])
    //         }
    //     }

    //     console.log(newArray[getRandomInt(newArray.length)].response_text)

    // })
}

runSample()