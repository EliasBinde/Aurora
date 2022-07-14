"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const imageHandler_1 = require("./modules/ticket/imageHandler");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const checkTicket_1 = require("./modules/ticket/checkTicket");
const fs = __importStar(require("fs"));
const uuid_1 = require("uuid");
const prisma_1 = __importDefault(require("./modules/util/prisma"));
const logger_1 = require("./modules/util/logger");
const stripe_1 = require("./modules/stripe/stripe");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)());
const jsonParser = body_parser_1.default.json({ limit: "200mb" });
app.post("/checkTicket", jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, imageHandler_1.imageHandler)(req.body.image);
    const aktenzeichen = parseInt(req.body.aktenzeichen);
    const result = yield (0, checkTicket_1.checkTicket)(data[0] || "", aktenzeichen);
    res.header("Access-Control-Allow-Origin", "*");
    res.send(result);
}));
app.get("/tickets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    (0, logger_1.log)({ evnt: "Vorgänge Liste abgefragt", type: "info" });
    res.send(yield prisma_1.default.ticket.findMany());
}));
app.get("/violations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    (0, logger_1.log)({ evnt: "Tatbestände Liste abgefragt", type: "info" });
    res.send(yield prisma_1.default.tatbestand.findMany());
}));
app.get("/locations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    (0, logger_1.log)({ evnt: "Locations Liste abgefragt", type: "info" });
    res.send(yield prisma_1.default.location.findMany());
}));
app.get("/logs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    //log({ evnt: "Logs abgefragt", type: "info" });
    res.send(yield prisma_1.default.log.findMany());
}));
app.get("/payments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    (0, logger_1.log)({ evnt: "Zahlungen Liste abgefragt", type: "info" });
    res.send(yield prisma_1.default.payment.findMany());
}));
app.post("/createCTicket", jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    const now = new Date();
    let filename = "";
    if (req.body.image) {
        const data = req.body.image;
        let base64Image = data.split(";base64,");
        const image = base64Image[1];
        const ext = data.substring("data:image/".length, data.indexOf(";base64"));
        filename = (0, uuid_1.v4)() + "." + ext;
        const dir = `public/images/${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFile(`${dir}/${filename}`, image, "base64", function (err) {
            (0, logger_1.log)({
                evnt: "Fehler beim speichern",
                type: "error",
                meta: err,
            });
        });
    }
    const ticket = yield prisma_1.default.ticket.findMany({
        select: {
            aktenzeichen: true,
        },
        orderBy: {
            aktenzeichen: "desc",
        },
        take: 1,
    });
    const newAZ = ticket[0].aktenzeichen + 1;
    const newTicket = yield prisma_1.default.ticket.create({
        data: {
            aktenzeichen: newAZ,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            licensePlate: req.body.licensePlate,
            locationId: req.body.locationID,
            tatbestand: req.body.violationID,
            time: now,
            proofImage: filename ? `${filename}` : null,
        },
    });
    (0, logger_1.log)({
        evnt: "Ticket erstellt",
        type: "info",
        aktenzeichen: req.body.aktenzeichen,
    });
}));
app.post("/createViolation", jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const desc = req.body.description;
    const stornoErlaubt = Boolean(req.body.stornoErlaubt);
    const dbRes = yield prisma_1.default.tatbestand.create({
        data: {
            description: desc,
            stornoErlaubt: stornoErlaubt,
            price: req.body.price,
            stripePriceId: req.body.stripePriceId,
        },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Tatbestand erstellt",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.aktenzeichen,
        });
        res.status(200).send(dbRes);
    }
    else {
        (0, logger_1.log)({
            evnt: "Tatbestand konnte nicht erstellt werden",
            type: "error",
            meta: JSON.stringify(req.body),
            aktenzeichen: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.aktenzeichen,
        });
        res.status(500).send("error");
    }
}));
app.delete("/deleteViolation/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    res.header("Access-Control-Allow-Origin", "*");
    const id = parseInt(req.params.id);
    const dbRes = yield prisma_1.default.tatbestand.delete({
        where: { id: id },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Tatbestand gelöscht",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.aktenzeichen,
        });
        res.status(200).send(dbRes);
    }
    else {
        (0, logger_1.log)({
            evnt: "Tatbestand konnte nicht gelöscht werden",
            type: "error",
            meta: JSON.stringify({ id: id }),
            aktenzeichen: (_d = req === null || req === void 0 ? void 0 : req.body) === null || _d === void 0 ? void 0 : _d.aktenzeichen,
        });
        res.status(500).send("error");
    }
}));
app.post("/createLocation", jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    res.header("Access-Control-Allow-Origin", "*");
    const dbRes = yield prisma_1.default.location.create({
        data: {
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            maxParkingMin: req.body.maxParkingMin,
        },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Location erstellt",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: (_e = req === null || req === void 0 ? void 0 : req.body) === null || _e === void 0 ? void 0 : _e.aktenzeichen,
        });
        res.status(200).send(dbRes);
    }
    else {
        (0, logger_1.log)({
            evnt: "Location konnte nicht erstellt werden",
            type: "error",
            meta: JSON.stringify(req.body),
            aktenzeichen: (_f = req === null || req === void 0 ? void 0 : req.body) === null || _f === void 0 ? void 0 : _f.aktenzeichen,
        });
        res.status(500).send("error");
    }
}));
app.get("/checkAz/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    const id = parseInt(req.params.id);
    const dbRes = yield prisma_1.default.ticket.findFirst({
        where: { aktenzeichen: id },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Ticket gefunden",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: id,
        });
        res.status(200).send("Success");
    }
    else {
        (0, logger_1.log)({
            evnt: "Ticket konnte nicht gefunden werden",
            type: "error",
            meta: JSON.stringify({ id: id }),
            aktenzeichen: id,
        });
        res.status(500).send("Not found");
    }
}));
app.delete("/deleteLocation/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    const id = parseInt(req.params.id);
    const dbRes = yield prisma_1.default.location.delete({
        where: { id: id },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Location gelöscht",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: id,
        });
        res.status(200).send(dbRes);
    }
    else {
        (0, logger_1.log)({
            evnt: "Location konnte nicht gelöscht werden",
            type: "error",
            meta: JSON.stringify({ id: id }),
            aktenzeichen: id,
        });
        res.status(500).send("error");
    }
}));
app.post("/createTicket", jsonParser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    res.header("Access-Control-Allow-Origin", "*");
    const dbRes = yield prisma_1.default.ticket.create({
        data: {
            aktenzeichen: parseInt(req.body.aktenzeichen),
            tatbestand: parseInt(req.body.tatbestand),
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            time: new Date(req.body.time),
            locationId: parseInt(req.body.locationId),
            licensePlate: req.body.licensePlate,
        },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Ticket erstellt",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: (_g = req === null || req === void 0 ? void 0 : req.body) === null || _g === void 0 ? void 0 : _g.aktenzeichen,
        });
        res.status(200).send(dbRes);
    }
    else {
        (0, logger_1.log)({
            evnt: "Ticket konnte nicht erstellt werden",
            type: "error",
            meta: JSON.stringify(req.body),
            aktenzeichen: (_h = req === null || req === void 0 ? void 0 : req.body) === null || _h === void 0 ? void 0 : _h.aktenzeichen,
        });
        res.status(500).send("error");
    }
}));
app.delete("/deleteTicket/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header("Access-Control-Allow-Origin", "*");
    const id = parseInt(req.params.id);
    const dbRes = yield prisma_1.default.ticket.delete({
        where: { id: id },
    });
    if (dbRes) {
        (0, logger_1.log)({
            evnt: "Ticket gelöscht",
            type: "info",
            meta: JSON.stringify(dbRes),
            aktenzeichen: id,
        });
        res.status(200).send(dbRes);
    }
    else {
        (0, logger_1.log)({
            evnt: "Ticket konnte nicht gelöscht werden",
            type: "error",
            meta: JSON.stringify({ id: id }),
            aktenzeichen: id,
        });
        res.status(500).send("error");
    }
}));
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
    const session = yield stripe_1.stripe.checkout.sessions.create({
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
app.post("/stripe-webhook", express_1.default.raw({ type: "application/json" }), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l, _m, _o, _p, _q;
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
                aktenzeichen: parseInt((_j = event.data.object) === null || _j === void 0 ? void 0 : _j.metadata.aktenzeichen),
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
                aktenzeichen: parseInt((_k = event.data.object) === null || _k === void 0 ? void 0 : _k.metadata.aktenzeichen),
            });
            break;
        case "charge.succeeded":
            (0, logger_1.log)({
                evnt: "Charge succeeded",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_l = event.data.object) === null || _l === void 0 ? void 0 : _l.metadata.aktenzeichen),
            });
            break;
        case "checkout.session.completed":
            (0, logger_1.log)({
                evnt: "Checkout session completed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_m = event.data.object) === null || _m === void 0 ? void 0 : _m.metadata.aktenzeichen),
            });
            break;
        case "charge.failed":
            (0, logger_1.log)({
                evnt: "Charge failed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_o = event.data.object) === null || _o === void 0 ? void 0 : _o.metadata.aktenzeichen),
            });
            break;
        case "payment_intent.payment_failed":
            (0, logger_1.log)({
                evnt: "Payment intent failed",
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_p = event.data.object) === null || _p === void 0 ? void 0 : _p.metadata.aktenzeichen),
            });
            break;
        default:
            (0, logger_1.log)({
                evnt: event.type,
                type: "info",
                meta: JSON.stringify(event.data.object),
                aktenzeichen: parseInt((_q = event.data.object) === null || _q === void 0 ? void 0 : _q.metadata.aktenzeichen),
            });
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
