"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
exports.stripe = new stripe_1.default("sk_test_51LIvs1BrL3wc97imXPsiKUc20uwhQktnfhla9CztTA8gvO06tZY5d3Gid608vI2t2JMD9FGTUEmyXg2N6TXFQVXb00l8TcD5s4", {
    apiVersion: "2020-08-27",
});
