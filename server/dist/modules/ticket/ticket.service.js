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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketService = void 0;
const ticketService = () => __awaiter(void 0, void 0, void 0, function* () {
    const createCTicket = () => __awaiter(void 0, void 0, void 0, function* () {
        const now = new Date();
        let filename = "";
        if (req.body.image) {
            const data = req.body.image;
            let base64Image = data.split(";base64,");
            const image = base64Image[1];
            const ext = data.substring("data:image/".length, data.indexOf(";base64"));
            filename = uuid() + "." + ext;
            const dir = `public/images/${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFile(`${dir}/${filename}`, image, "base64", function (err) {
                log({
                    evnt: "Fehler beim speichern",
                    type: "error",
                    meta: err,
                });
            });
        }
        const ticket = yield prisma.ticket.findMany({
            select: {
                aktenzeichen: true,
            },
            orderBy: {
                aktenzeichen: "desc",
            },
            take: 1,
        });
        const newAZ = ticket[0].aktenzeichen + 1;
        const newTicket = yield prisma.ticket.create({
            data: {
                aktenzeichen: newAZ,
                address: req.body.address,
                city: req.body.city,
                postalCode: req.body.postalCode,
                licensePlate: req.body.licensePlate,
                locationId: req.body.locationId,
                tatbestand: req.body.violationID,
                time: now,
                proofImage: filename ? `${filename}` : null,
            },
        });
        log({
            evnt: "Ticket erstellt",
            type: "info",
            aktenzeichen: req.body.aktenzeichen,
        });
    });
});
exports.ticketService = ticketService;
