const { getBattery } = require('../functions/getBattery'); 
const doRequest = require('../handler/httpRequestHandler'); 

// Mocking doRequest.axios_request method
jest.mock('../handler/httpRequestHandler');

describe('getBattery Function', () => {
    const context = {}; 

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return battery percentage when response is successful', async () => {
        // Mock successful response from doRequest.axios_request
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {
                    batteryLevel: { value: 85 }
                }
            }
        });

        const request = { params: { id: '1' } };
        const result = await getBattery(request, context);

        expect(result).toEqual({
            jsonBody: {
                percent: 85
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
                message: "Battery information not available"
            }
        });

        const request = { params: { id: '1' } };
        const result = await getBattery(request, context);

        expect(result.jsonBody).toEqual({
            body: {
                error: true,
                message: "Battery information not available"
            }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });

    test('should handle missing batteryLevel in data gracefully', async () => {
        // Mock response with data but missing batteryLevel
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {}
            }
        });

        const request = { params: { id: '2' } };
        const result = await getBattery(request, context);

        expect(result.jsonBody).toEqual({
            body: { error: false, data: {} }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });

    test('should handle empty data object gracefully', async () => {
        // Mock response with an empty data object
        doRequest.axios_request.mockResolvedValue({
            body: {
                error: false,
                data: {}
            }
        });

        const request = { params: { id: '3' } };
        const result = await getBattery(request, context);

        expect(result.jsonBody).toEqual({
            body: { error: false, data: {} }
        });
        expect(doRequest.axios_request).toHaveBeenCalledTimes(1);
    });
});
