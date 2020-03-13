"use strict";
var jsonSchema_1 = require("./hooks/jsonSchema");
var ServerlessTypescript = /** @class */ (function () {
    function ServerlessTypescript(serverless, options) {
        var _this = this;
        this.hooks = {
            'before:package:createDeploymentArtifacts': function () {
                jsonSchema_1.main(_this.serverless);
            },
        };
        this.serverless = serverless;
        this.options = options;
    }
    return ServerlessTypescript;
}());
module.exports = ServerlessTypescript;
