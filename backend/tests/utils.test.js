import { toCsv } from "../src/utils/csv.js";
import {
  clampDiscount,
  fromPaisa,
  money,
  percentDiscount,
  toPaisa,
} from "../src/utils/money.js";
import { sanitizeCmsHtml } from "../src/utils/sanitize.js";
import { slugify, uniqueSlug } from "../src/utils/slug.js";

describe("money helpers", () => {
  test("convert between rupees and integer paisa", () => {
    expect(toPaisa(19.995)).toBe(2000);
    expect(toPaisa("250.50")).toBe(25050);
    expect(fromPaisa(25050)).toBe(250.5);
  });

  test("round once to two decimals", () => {
    expect(money(19.999)).toBe(20);
    expect(money("15.556")).toBe(15.56);
    expect(money(null)).toBe(0);
  });

  test("calculate and clamp percentage discounts", () => {
    expect(percentDiscount(1999, 10)).toBe(199.9);
    expect(clampDiscount(5000, 1999)).toBe(1999);
    expect(clampDiscount(-10, 1999)).toBe(0);
  });
});

describe("slug helpers", () => {
  test("create lowercase URL-safe slugs", () => {
    expect(slugify("  Classic Cotton Shirt! ")).toBe("classic-cotton-shirt");
    expect(slugify("Café & Co")).toBe("cafe-co");
  });

  test("fall back when the base has no usable characters", () => {
    expect(uniqueSlug("!!!", "1")).toBe("item-1");
    expect(uniqueSlug("", "")).toBe("item");
  });
});

describe("CSV helper", () => {
  test("escapes commas, quotes, and new lines", () => {
    const csv = toCsv(
      [
        { name: "A, B", note: 'He said "hi"' },
        { name: "Line\nbreak", note: null },
      ],
      [
        { key: "name", label: "Name" },
        { key: "note", label: "Note" },
      ],
    );

    expect(csv).toBe(
      'Name,Note\r\n"A, B","He said ""hi"""\r\n"Line\nbreak",',
    );
  });
});

describe("CMS HTML sanitizer", () => {
  test("removes scripts and event handlers", () => {
    const html = sanitizeCmsHtml(
      '<p onclick="alert(1)">Hello<script>alert(1)</script></p>',
    );

    expect(html).toBe("<p>Hello</p>");
  });

  test("keeps safe links and forces a safe rel attribute", () => {
    const html = sanitizeCmsHtml(
      '<a href="https://example.com" target="_blank">Visit</a>',
    );

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  test("drops unsafe URL schemes", () => {
    const html = sanitizeCmsHtml('<a href="javascript:alert(1)">Bad</a>');

    expect(html).not.toContain("javascript:");
  });
});
