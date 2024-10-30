const getVehicle  = require('../functions/getVehicle'); 
const doRequest = require('../handler/httpRequestHandler');

// Mocking doRequest.axios_request method
jest.mock('../handler/httpRequestHandler');

describe('getVehicle Function', () => {
    const context = {}; // Mock context if needed

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return vehicle information when response is successful', async () => {
        // Mock successful response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {
                    vin: { value: '123456789' },
                    color: { value: 'Red' },
                    fourDoorSedan: { value: true },
                    driveTrain: { value: 'AWD' }
                }
            }
        });

        const request = { params: { id: '1' } };
        const result = await getVehicle.vehicleHandler(request, context);

        expect(result).toEqual({
            jsonBody: {
                vin: '123456789',
                color: 'Red',
                doorCount: '4',
                driveTrain: 'AWD'
            }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
        expect(doRequest.axios_request).toHaveBeenCalledWith({
            method: 'POST',
            url: 'http://gmapi.azurewebsites.net/getVehicleInfoService',
            data: { id: '1', responseType: "JSON" },
            headers: { 'Content-Type': 'application/json' }
        });
    });

    test('should return error response when an error occurs', async () => {
        // Mock error response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: true,
                message: "Vehicle not found"
            }
        });

        const request = { params: { id: '1' } };
        const result = await getVehicle.vehicleHandler(request, context);

        expect(result.jsonBody).toEqual({
            body: {
                error: true,
                message: "Vehicle not found"
            }
        });
    });

    test('should set doorCount to "2" for a two-door vehicle', async () => {
        // Mock response indicating a two-door vehicle
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {
                    vin: { value: '987654321' },
                    color: { value: 'Blue' },
                    fourDoorSedan: { value: false },
                    driveTrain: { value: 'FWD' }
                }
            }
        });

        const request = { params: { id: '2' } };
        const result = await getVehicle.vehicleHandler(request, context);

        expect(result).toEqual({
            jsonBody: {
                vin: '987654321',
                color: 'Blue',
                doorCount: '2',
                driveTrain: 'FWD'
            }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });
});