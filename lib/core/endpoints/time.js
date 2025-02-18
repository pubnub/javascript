"use strict";
/**
 * Time REST API module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeRequest = void 0;
const request_1 = require("../components/request");
const operations_1 = __importDefault(require("../constants/operations"));
// endregion
/**
 * Get current PubNub high-precision time request.
 *
 * @internal
 */
class TimeRequest extends request_1.AbstractRequest {
    constructor() {
        super();
    }
    operation() {
        return operations_1.default.PNTimeOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return { timetoken: this.deserializeResponse(response)[0] };
        });
    }
    get path() {
        return '/time/0';
    }
}
exports.TimeRequest = TimeRequest;
