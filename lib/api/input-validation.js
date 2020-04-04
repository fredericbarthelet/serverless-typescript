"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBody = function (event) {
    return JSON.parse(event.body);
};
