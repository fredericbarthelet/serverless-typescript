"use strict";
var hooks_1 = require("./hooks");
var ServerlessTypescript = /** @class */ (function () {
    function ServerlessTypescript(serverless, options) {
        var _this = this;
        this.hooks = {
            'before:package:createDeploymentArtifacts': function () {
                hooks_1.inputValidation(_this.serverless);
            },
        };
        this.serverless = serverless;
        this.options = options;
    }
    return ServerlessTypescript;
}());
module.exports = ServerlessTypescript;
