"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooks = void 0;
const logger_1 = require("../util/logger");
const express_1 = __importDefault(require("express"));
const webhooks = (app, stripe) => {
    const endpointSecret = "whsec_4bc29ffc9371d92dba53e300ec1fc1d86d9a17d0274748aba1bafc38acdf9881";
    app.post("/stripe-webhook", express_1.default.raw({ type: "application/json" }), (request, response) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const sig = request.headers["stripe-signature"];
        let event;
        try {
            event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        }
        catch (err) {
            (0, logger_1.log)({
                evnt: "Webhook error",
                type: "error",
                meta: JSON.stringify(err),
            });
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        // Handle the event
        switch (event.type) {
            case "payment_intent.created":
                (0, logger_1.log)({
                    evnt: "Payment intent created",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_a = event.data.object) === null || _a === void 0 ? void 0 : _a.metadata.aktenzeichen),
                });
                break;
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                (0, logger_1.log)({
                    evnt: "Payment intent succeeded",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_b = event.data.object) === null || _b === void 0 ? void 0 : _b.metadata.aktenzeichen),
                });
                break;
            case "payment_intent.payment_failed":
                (0, logger_1.log)({
                    evnt: "Payment intent failed",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_c = event.data.object) === null || _c === void 0 ? void 0 : _c.metadata.aktenzeichen),
                });
                break;
            case "charge.succeeded":
                (0, logger_1.log)({
                    evnt: "Charge succeeded",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_d = event.data.object) === null || _d === void 0 ? void 0 : _d.metadata.aktenzeichen),
                });
                break;
            case "checkout.session.completed":
                (0, logger_1.log)({
                    evnt: "Checkout session completed",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_e = event.data.object) === null || _e === void 0 ? void 0 : _e.metadata.aktenzeichen),
                });
                break;
            case "charge.failed":
                (0, logger_1.log)({
                    evnt: "Charge failed",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_f = event.data.object) === null || _f === void 0 ? void 0 : _f.metadata.aktenzeichen),
                });
                break;
            case "payment_intent.payment_failed":
                (0, logger_1.log)({
                    evnt: "Payment intent failed",
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_g = event.data.object) === null || _g === void 0 ? void 0 : _g.metadata.aktenzeichen),
                });
                break;
            default:
                (0, logger_1.log)({
                    evnt: event.type,
                    type: "info",
                    meta: JSON.stringify(event.data.object),
                    aktenzeichen: parseInt((_h = event.data.object) === null || _h === void 0 ? void 0 : _h.metadata.aktenzeichen),
                });
        }
        // Return a 200 response to acknowledge receipt of the event
        response.send();
    });
};
exports.webhooks = webhooks;
