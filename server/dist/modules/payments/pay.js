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
exports.pay = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = require("../logger");
const pay = (app, stripe) => __awaiter(void 0, void 0, void 0, function* () {
    const jsonParser = body_parser_1.default.json({ limit: "200mb" });
    app.post("/pay", jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.header("Access-Control-Allow-Origin", "*");
        const id = parseInt(req.body.aktenzeichen);
        const incident = yield prisma_1.default.ticket.findFirst({
            where: { aktenzeichen: id },
        });
        const vioaltion = yield prisma_1.default.tatbestand.findFirst({
            where: { id: incident === null || incident === void 0 ? void 0 : incident.tatbestand },
        });
        const stripePriceId = vioaltion === null || vioaltion === void 0 ? void 0 : vioaltion.stripePriceId;
        if (!stripePriceId) {
            res.status(500).send("not found");
            return;
        }
        (0, logger_1.log)({
            evnt: "Payment started",
            type: "info",
            meta: JSON.stringify({ id: id, stripePriceId: stripePriceId }),
            aktenzeichen: id,
        });
        const session = yield stripe.checkout.sessions.create({
            line_items: [
                {
                    price: stripePriceId,
                    quantity: 1,
                },
            ],
            mode: "payment",
            payment_intent_data: {
                metadata: {
                    aktenzeichen: req.body.aktenzeichen,
                },
            },
            success_url: `http://localhost:3000/success`,
            cancel_url: `http://localhost:3000/cancel`,
        });
        (0, logger_1.log)({
            evnt: "Payment session created",
            type: "info",
            meta: JSON.stringify(session),
            aktenzeichen: id,
        });
        res.send(session.url);
    }));
});
exports.pay = pay;
