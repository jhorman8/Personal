const { app } = require('@azure/functions');
const doRequest = require('../handler/httpRequestHandler');
const defaultUrl = 'http://gmapi.azurewebsites.net/getVehicleInfoService'; //TO DO ADD THIS AS AN ENVIRONMENT VARIABLE


async function vehicleHandler(request, context) {
    const id = request.params.id;

    let options = {
        method: 'POST',
        url: defaultUrl,
        data: {
            id: id,
            responseType: "JSON"
        },
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const response = await doRequest.axios_request(options);
    if (!response.body.error) {
        const newBody = {
            vin: response.body.data.vin.value,
            color: response.body.data.color.value,
            doorCount: response.body.data.fourDoorSedan.value == true ? '4' : '2',
            driveTrain: response.body.data.driveTrain.value
        }
        return { jsonBody: newBody };
    } else {
        return { jsonBody: response };

    }

}


app.http('vehicles', {
    methods: ['GET'],
    route: 'vehicles/{id}',
    authLevel: 'anonymous', //key provided for Azure Function resource
    handler: vehicleHandler
});

module.exports = { vehicleHandler }