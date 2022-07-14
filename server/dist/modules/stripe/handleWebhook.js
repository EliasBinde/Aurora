"use strict";
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
exports.handleWebhook = void 0;
const stripe_1 = require("../stripe/stripe");
const logger_1 = require("../util/logger");
const prisma_1 = __importDefault(require("../util/prisma"));
const handleWebhook = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const endpointSecret = "whsec_4bc29ffc9371d92dba53e300ec1fc1d86d9a17d0274748aba1bafc38acdf9881";
    const sig = request.headers["stripe-signature"];
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
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
                aktenzeichen: parseInt(paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata.aktenzeichen),
            });
            const aktenzeichen = parseInt(paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata.aktenzeichen);
            const incident = yield prisma_1.default.ticket.findFirst({
                where: { aktenzeichen: aktenzeichen },
            });
            if (incident) {
                yield prisma_1.default.ticket.update({
                    where: { id: incident.id },
                    data: {
                        status: "paid",
                    },
                });
            }
            break;
        case "payment_intent.payment_failed":
            (0, logger_1.log)({
                evnt: "Payment intent failed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_b = event.data.object) === null || _b === void 0 ? void 0 : _b.metadata.aktenzeichen),
            });
            break;
        case "charge.succeeded":
            (0, logger_1.log)({
                evnt: "Charge succeeded",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_c = event.data.object) === null || _c === void 0 ? void 0 : _c.metadata.aktenzeichen),
            });
            break;
        case "checkout.session.completed":
            (0, logger_1.log)({
                evnt: "Checkout session completed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_d = event.data.object) === null || _d === void 0 ? void 0 : _d.metadata.aktenzeichen),
            });
            break;
        case "charge.failed":
            (0, logger_1.log)({
                evnt: "Charge failed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_e = event.data.object) === null || _e === void 0 ? void 0 : _e.metadata.aktenzeichen),
            });
            break;
        case "payment_intent.payment_failed":
            (0, logger_1.log)({
                evnt: "Payment intent failed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_f = event.data.object) === null || _f === void 0 ? void 0 : _f.metadata.aktenzeichen),
            });
            break;
        default:
            (0, logger_1.log)({
                evnt: event.type,
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_g = event.data.object) === null || _g === void 0 ? void 0 : _g.metadata.aktenzeichen),
            });
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
});
exports.handleWebhook = handleWebhook;
