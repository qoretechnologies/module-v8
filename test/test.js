exports.qtester = {
    /** testapi has two properties:
        - createConnection: function (app: string, opts?: object) : string
            parameters:
            - app: the app name
            - opts: optional connection options - normally this should have a 'token' property at least so calls can
            be made
            return value: the technical name of the connection that must be used in the execAppAction() call
        - execAppAction: function (app: string, action: string, connection: string, req?: object, request_opts?: object) : any
            parameters:
            - app: the app name
            - action: the action name
            - connection: the connection name created by the createConnection() call
            - req: the API args
            - request_opts: the request options
            return value: the return value of the API call
    */
    run: function(testapi) {
        c = testapi.createConnection('js-swagger-test', {
            'opts': {
                'subdomain': 'www',
            },
        });
        res = testapi.execAppAction('js-swagger-test', 'create-pet', c, {
            'body': {
                'id': 'Test',
                'name': 'Rex',
                'photoUrls': [],
            },
        }, null, true);
        if (res != true) {
            throw new Error('Err');
        } else {
            console.log('OK');
        }
    }
};
