import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { imageHandler } from "./modules/ticket/imageHandler";
import cors from "cors";
import bodyParser from "body-parser";
import { checkTicket } from "./modules/ticket/checkTicket";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import prisma from "./modules/util/prisma";
import { log } from "./modules/util/logger";
import { stripe } from "./modules/stripe/stripe";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());

const jsonParser = bodyParser.json({ limit: "200mb" });

app.post("/checkTicket", jsonParser, async (req: Request, res: Response) => {
  const data = await imageHandler(req.body.image);

  const aktenzeichen = parseInt(req.body.aktenzeichen);

  const result = await checkTicket(data[0] || "", aktenzeichen);

  res.header("Access-Control-Allow-Origin", "*");

  res.send(result);
});

app.get("/tickets", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  log({ evnt: "Vorgänge Liste abgefragt", type: "info" });
  res.send(await prisma.ticket.findMany());
});
app.get("/violations", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  log({ evnt: "Tatbestände Liste abgefragt", type: "info" });
  res.send(await prisma.tatbestand.findMany());
});
app.get("/locations", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  log({ evnt: "Locations Liste abgefragt", type: "info" });
  res.send(await prisma.location.findMany());
});
app.get("/logs", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  //log({ evnt: "Logs abgefragt", type: "info" });
  res.send(await prisma.log.findMany());
});
app.get("/payments", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  log({ evnt: "Zahlungen Liste abgefragt", type: "info" });
  res.send(await prisma.payment.findMany());
});

app.post("/createCTicket", jsonParser, async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");

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

    fs.writeFile(`${dir}/${filename}`, image, "base64", function (err: any) {
      log({
        evnt: "Fehler beim speichern",
        type: "error",
        meta: err,
      });
    });
  }
  const ticket = await prisma.ticket.findMany({
    select: {
      aktenzeichen: true,
    },
    orderBy: {
      aktenzeichen: "desc",
    },
    take: 1,
  });
  const newAZ = ticket[0].aktenzeichen + 1;

  const newTicket = await prisma.ticket.create({
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
  log({
    evnt: "Ticket erstellt",
    type: "info",
    aktenzeichen: req.body.aktenzeichen,
  });
});

app.post(
  "/createViolation",
  jsonParser,
  async (req: Request, res: Response) => {
    const desc = req.body.description;
    const stornoErlaubt = Boolean(req.body.stornoErlaubt);
    const dbRes = await prisma.tatbestand.create({
      data: {
        description: desc,
        stornoErlaubt: stornoErlaubt,
        price: req.body.price,
        stripePriceId: req.body.stripePriceId,
      },
    });
    if (dbRes) {
      log({
        evnt: "Tatbestand erstellt",
        type: "info",
        meta: JSON.stringify(dbRes),
        aktenzeichen: req?.body?.aktenzeichen,
      });
      res.status(200).send(dbRes);
    } else {
      log({
        evnt: "Tatbestand konnte nicht erstellt werden",
        type: "error",
        meta: JSON.stringify(req.body),
        aktenzeichen: req?.body?.aktenzeichen,
      });
      res.status(500).send("error");
    }
  }
);
app.delete("/deleteViolation/:id", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  const id = parseInt(req.params.id);
  const dbRes = await prisma.tatbestand.delete({
    where: { id: id },
  });
  if (dbRes) {
    log({
      evnt: "Tatbestand gelöscht",
      type: "info",
      meta: JSON.stringify(dbRes),
      aktenzeichen: req?.body?.aktenzeichen,
    });
    res.status(200).send(dbRes);
  } else {
    log({
      evnt: "Tatbestand konnte nicht gelöscht werden",
      type: "error",
      meta: JSON.stringify({ id: id }),
      aktenzeichen: req?.body?.aktenzeichen,
    });
    res.status(500).send("error");
  }
});

app.post("/createLocation", jsonParser, async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");

  const dbRes = await prisma.location.create({
    data: {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      postalCode: req.body.postalCode,
      maxParkingMin: req.body.maxParkingMin,
    },
  });
  if (dbRes) {
    log({
      evnt: "Location erstellt",
      type: "info",
      meta: JSON.stringify(dbRes),
      aktenzeichen: req?.body?.aktenzeichen,
    });
    res.status(200).send(dbRes);
  } else {
    log({
      evnt: "Location konnte nicht erstellt werden",
      type: "error",
      meta: JSON.stringify(req.body),
      aktenzeichen: req?.body?.aktenzeichen,
    });
    res.status(500).send("error");
  }
});

app.get("/checkAz/:id", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  const id = parseInt(req.params.id);
  const dbRes = await prisma.ticket.findFirst({
    where: { aktenzeichen: id },
  });
  if (dbRes) {
    log({
      evnt: "Ticket gefunden",
      type: "info",
      meta: JSON.stringify(dbRes),
      aktenzeichen: id,
    });
    res.status(200).send("Success");
  } else {
    log({
      evnt: "Ticket konnte nicht gefunden werden",
      type: "error",
      meta: JSON.stringify({ id: id }),
      aktenzeichen: id,
    });
    res.status(500).send("Not found");
  }
});

app.delete("/deleteLocation/:id", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  const id = parseInt(req.params.id);
  const dbRes = await prisma.location.delete({
    where: { id: id },
  });
  if (dbRes) {
    log({
      evnt: "Location gelöscht",
      type: "info",
      meta: JSON.stringify(dbRes),
      aktenzeichen: id,
    });

    res.status(200).send(dbRes);
  } else {
    log({
      evnt: "Location konnte nicht gelöscht werden",
      type: "error",
      meta: JSON.stringify({ id: id }),
      aktenzeichen: id,
    });
    res.status(500).send("error");
  }
});

app.post("/createTicket", jsonParser, async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  const dbRes = await prisma.ticket.create({
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
    log({
      evnt: "Ticket erstellt",
      type: "info",
      meta: JSON.stringify(dbRes),
      aktenzeichen: req?.body?.aktenzeichen,
    });

    res.status(200).send(dbRes);
  } else {
    log({
      evnt: "Ticket konnte nicht erstellt werden",
      type: "error",
      meta: JSON.stringify(req.body),
      aktenzeichen: req?.body?.aktenzeichen,
    });
    res.status(500).send("error");
  }
});
app.delete("/deleteTicket/:id", async (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "*");
  const id = parseInt(req.params.id);
  const dbRes = await prisma.ticket.delete({
    where: { id: id },
  });
  if (dbRes) {
    log({
      evnt: "Ticket gelöscht",
      type: "info",
      meta: JSON.stringify(dbRes),
      aktenzeichen: id,
    });
    res.status(200).send(dbRes);
  } else {
    log({
      evnt: "Ticket konnte nicht gelöscht werden",
      type: "error",
      meta: JSON.stringify({ id: id }),
      aktenzeichen: id,
    });
    res.status(500).send("error");
  }
});

app.post("/pay", jsonParser, async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const id = parseInt(req.body.aktenzeichen);

  const incident = await prisma.ticket.findFirst({
    where: { aktenzeichen: id },
  });
  const vioaltion = await prisma.tatbestand.findFirst({
    where: { id: incident?.tatbestand },
  });

  const stripePriceId = vioaltion?.stripePriceId;

  if (!stripePriceId) {
    res.status(500).send("not found");
    return;
  }

  log({
    evnt: "Payment started",
    type: "info",
    meta: JSON.stringify({ id: id, stripePriceId: stripePriceId }),
    aktenzeichen: id,
  });

  const session = await stripe.checkout.sessions.create({
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

  log({
    evnt: "Payment session created",
    type: "info",
    meta: JSON.stringify(session),
    aktenzeichen: id,
  });

  res.send(session.url);
});

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (request: Request, response: Response) => {
    const endpointSecret =
      "whsec_4bc29ffc9371d92dba53e300ec1fc1d86d9a17d0274748aba1bafc38acdf9881";
    const sig: any = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err: any) {
      log({
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
        log({
          evnt: "Payment intent created",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        log({
          evnt: "Payment intent succeeded",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt((paymentIntent as any)?.metadata.aktenzeichen),
        });

        const aktenzeichen = parseInt(
          (paymentIntent as any)?.metadata.aktenzeichen
        );
        const incident = await prisma.ticket.findFirst({
          where: { aktenzeichen: aktenzeichen },
        });

        if (incident) {
          await prisma.ticket.update({
            where: { id: incident.id },
            data: {
              status: "paid",
            },
          });
        }

        break;

      case "payment_intent.payment_failed":
        log({
          evnt: "Payment intent failed",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });

        break;

      case "charge.succeeded":
        log({
          evnt: "Charge succeeded",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });
        break;

      case "checkout.session.completed":
        log({
          evnt: "Checkout session completed",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });

        break;

      case "charge.failed":
        log({
          evnt: "Charge failed",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });

        break;

      case "payment_intent.payment_failed":
        log({
          evnt: "Payment intent failed",
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });
        break;

      default:
        log({
          evnt: event.type,
          type: "info",
          meta: JSON.stringify(event.data.object),
          aktenzeichen: parseInt(
            (event.data.object as any)?.metadata.aktenzeichen
          ),
        });
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
