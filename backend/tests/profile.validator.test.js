import {
  changePasswordSchema,
  updateProfileSchema,
} from "../src/validators/profile.validator.js";

describe("profile validators", () => {
  it("normalizes a valid profile and clears an empty phone", () => {
    const result = updateProfileSchema.parse({
      full_name: "  Ayesha Khan  ",
      phone: "",
    });

    expect(result).toEqual({
      full_name: "Ayesha Khan",
      phone: undefined,
    });
  });

  it("accepts common Pakistani phone formats", () => {
    for (const phone of ["03001234567", "+92 300 1234567", "021-1234567"]) {
      expect(() =>
        updateProfileSchema.parse({ full_name: "Ali Raza", phone }),
      ).not.toThrow();
    }
  });

  it("rejects an invalid phone number", () => {
    expect(() =>
      updateProfileSchema.parse({
        full_name: "Ali Raza",
        phone: "not-a-phone",
      }),
    ).toThrow();
  });

  it("rejects privileged fields such as role", () => {
    expect(() =>
      updateProfileSchema.parse({
        full_name: "Ali Raza",
        role: "admin",
      }),
    ).toThrow();
  });

  it("requires a strong new password", () => {
    expect(() =>
      changePasswordSchema.parse({
        current_password: "old-password",
        new_password: "weak",
      }),
    ).toThrow();

    expect(() =>
      changePasswordSchema.parse({
        current_password: "old-password",
        new_password: "StrongPass1",
      }),
    ).not.toThrow();
  });
});
