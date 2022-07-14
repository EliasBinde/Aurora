"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.db = {
    locations: [
        {
            id: 1,
            name: "EDEKA",
            address: "Schlüterstrasse 3 B",
            city: "Düsseldorf",
            postalCode: "40235",
            maxParkingMin: 30,
        },
        {
            id: 2,
            name: "REWE",
            address: "Flurstraße 16-18",
            city: "Mettmann",
            postalCode: "40822",
            maxParkingMin: 30,
        },
        {
            id: 3,
            name: "PENNY",
            address: "Champagne 16",
            city: "Mettmann",
            postalCode: "40822",
            maxParkingMin: 30,
        },
        {
            id: 4,
            name: "SCHLOSS BURGER GmbH",
            address: "Steinstr. 25",
            city: "Hamburg",
            postalCode: "20095",
            maxParkingMin: 30,
        },
    ],
    tickets: [
        {
            id: 12345678,
            location: {
                id: null,
                address: "Schlüterstrasse 3 B",
                city: "Düsseldorf",
                postalCode: "40235",
            },
            time: "1654877760",
            licensePlate: "ME LK 721",
            tatbestand: 1,
        },
        {
            id: 23456789,
            location: {
                id: 1,
                address: "Schlüterstrasse 3 B",
                city: "Düsseldorf",
                postalCode: "40235",
            },
            time: "1654964160",
            licensePlate: "D UW 7322",
            tatbestand: 5,
        },
        {
            id: 34567890,
            location: {
                id: null,
                address: "Champagne 16",
                city: "Mettmann",
                postalCode: "40822",
            },
            time: "1655050560",
            licensePlate: "WU MA 6655",
            tatbestand: 2,
        },
        {
            id: 55555555,
            location: {
                id: null,
                address: "Steinstr. 25",
                city: "Hamburg",
                postalCode: "20095",
            },
            time: "1655998783",
            licensePlate: "ME LK 712",
            tatbestand: 2,
        },
    ],
    tatbestände: [
        {
            id: 1,
            description: "Fehlende Parkscheibe",
            stornoErlaubt: true,
        },
        {
            id: 2,
            description: "Parkdauer überschritten (Parkscheibe)",
            stornoErlaubt: true,
        },
        {
            id: 3,
            description: "Parken ohne Parkschein",
            stornoErlaubt: false,
        },
        {
            id: 4,
            description: "Parkdauer überschritten (Parkschein)",
            stornoErlaubt: false,
        },
        {
            id: 5,
            description: "Parken außerhalb der Markierungen",
            stornoErlaubt: false,
        },
        {
            id: 6,
            description: "fehlende Parkbereichung",
            stornoErlaubt: false,
        },
        {
            id: 7,
            description: "Parken auf Behindertenparkplatz",
            stornoErlaubt: false,
        },
    ],
};
