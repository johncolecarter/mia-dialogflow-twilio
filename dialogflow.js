const dialogflow = require('@google-cloud/dialogflow');
const { request } = require('express');
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
                text: 'pool',
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
    // console.log(result)

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