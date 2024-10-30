const { getFuel } = require('../functions/getFuelRange'); 
const doRequest = require('../handler/httpRequestHandler'); 

// Mocking doRequest.axios_request method
jest.mock('../handler/httpRequestHandler');

describe('getFuel Function', () => {
    const context = {};

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return fuel percentage when response is successful', async () => {
        // Mock successful response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {
                    tankLevel: { value: 75 }
                }
            }
        });

        const request = { params: { id: '1' } };
        const result = await getFuel(request, context);

        expect(result).toEqual({
            jsonBody: {
                percent: 75
            }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
        expect(doRequest.axios_request).toHaveBeenCalledWith({
            method: 'POST',
            url: 'http://gmapi.azurewebsites.net/getEnergyService',
            data: { id: '1', responseType: "JSON" },
            headers: { 'Content-Type': 'application/json' }
        });
    });

    test('should return error response when an error occurs', async () => {
        // Mock error response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: true,
                message: "Fuel level not available"
            }
        });

        const request = { params: { id: '1' } };
        const result = await getFuel(request, context);

        expect(result.jsonBody).toEqual({
            body: {
                error: true,
                message: "Fuel level not available"
            }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });

    test('should handle missing tankLevel value gracefully', async () => {
        // Mock response with missing tankLevel data
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {}
            }
        });

        const request = { params: { id: '2' } };
        const result = await getFuel(request, context);

        expect(result.jsonBody).toEqual({
            body: { error: false, data: {} }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });
});