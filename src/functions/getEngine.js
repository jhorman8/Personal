const { app } = require('@azure/functions');
const doRequest = require('../handler/httpRequestHandler');
const defaultUrl = 'http://gmapi.azurewebsites.net/actionEngineService'; //TO DO ADD THIS AS AN ENVIRONMENT VARIABLE

async function engineHandler(request, context) {
    const id = request.params.id;

    const body = await request.json();

    if (!body || !body.action) {
        return {
            status: 400,
            jsonBody: { statusCode: 400, error: { type: 'Error response', data: "Action is required in the request body" } }
        };
    }


    let options = {
        method: 'POST',
        url: defaultUrl,
        data: {
            id: id,
            command: body.action,
            responseType: "JSON"
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const response = await doRequest.axios_request(options);
    if (!response.body.error) {
        const newBody = {
            status: response.body.actionResult.status === 'EXECUTED' ? 'success' : 'error'
        };

        return { jsonBody: newBody };
    } else {
        return { jsonBody: response };
    }
}

// Use the function as the handler in app.http
app.http('engine', {
    methods: ['POST'],
    route: 'vehicles/{id}/engine',
    authLevel: 'anonymous',
    handler: engineHandler  // Reference the standalone function
});

module.exports = { engineHandler }