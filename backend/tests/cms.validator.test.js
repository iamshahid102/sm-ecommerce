import { settingsSchema } from "../src/validators/cms.validator.js";

const baseSettings = {
  store_name: "SM Store",
  currency: "PKR",
  currency_symbol: "Rs",
  shipping_fee: 250,
  tax_percent: 0,
  cod_enabled: true,
};

describe("CMS settings validator", () => {
  test("accepts http(s) social links and empty values", () => {
    const result = settingsSchema.parse({
      ...baseSettings,
      social_links: {
        facebook: "https://facebook.com/smstore",
        instagram: "",
      },
    });

    expect(result.social_links.facebook).toBe("https://facebook.com/smstore");
    expect(result.social_links.instagram).toBe("");
  });

  test("rejects unsafe social link schemes", () => {
    const result = settingsSchema.safeParse({
      ...baseSettings,
      social_links: { facebook: "javascript:alert(1)" },
    });

    expect(result.success).toBe(false);
  });
});
