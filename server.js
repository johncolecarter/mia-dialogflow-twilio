const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const axios = require('axios');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    let text = req.body.Body;

    async function getResponse(projectId = 'project-mia-260217') {
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
                    text: text,
                    // The language used by the client (en-US)
                    languageCode: 'en-US',
                },
            },
        };

        // Send request and log result
        const responses = await sessionClient.detectIntent(request);
        console.log('Detected intent');
        // console.log(responses)
        const result = responses[0].queryResult;
        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        if (result.intent) {
            console.log(`  Intent: ${result.intent.displayName}`);
        } else {
            console.log(`  No intent matched.`);
        }


        axios.get(`http://localhost:3000/api/v1/community/98fb8529-7a06-4398-961d-7696b872bb82/intent/${result.intent.displayName}/response`).then(response => {
            let array = response.data.communityIntentUsesGlobalIntentResponse;

            let newArray = [];

            for (let i = 0; i < array.length; i++) {
                let active = array[i].is_active

                if (active === 1) {
                    newArray.push(array[i])
                }
            }

            let data = newArray[getRandomInt(newArray.length)].response_text

            console.log(data)

            twiml.message(data);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());

        })
    }

    getResponse()

});


http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});

// twilio phone-numbers:update "+13465678398" --sms-url="http://localhost:1337/sms"