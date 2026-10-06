const { z } = require('zod');

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const siteSchema = z.object({
  name: z.string().trim().min(2, "Site name is required").max(120),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{2,30}$/, "Code must be 2-30 letters, digits, - or _"),
  address: optionalText(300),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
  radiusMeters: z.coerce
    .number()
    .int("Radius must be a whole number of meters")
    .min(10, `Radius must be at least 10 m`)
    .max(5000, `Radius must be at most 5000 m`),
  isActive: z.boolean().default(true),
  projectName: optionalText(120),
  region: optionalText(80),
});

const data = {
  name: "Akgec",
  code: "402",
  latitude: 28.675656,
  longitude: 77.502912,
  radiusMeters: 100,
  isActive: true,
  projectName: "",
  region: "",
  address: "Ajay Kumar Garg Engineering College - AKGEC, Ghaziabad"
};

const result = siteSchema.safeParse(data);
console.log(JSON.stringify(result, null, 2));
