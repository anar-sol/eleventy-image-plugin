const { configure } = require("../image.js");
const path = require("path");
const { JSDOM } = require("jsdom");
const { getByRole } = require("@testing-library/dom");
require("@testing-library/jest-dom");

// Photo by Sadi Gökpınar: https://www.pexels.com/photo/man-making-pottery-18025831/
const filePath = "test-content/image.jpg";
const absolutePath = path.join(__dirname, filePath);

let image;
let metadata;
let html;

beforeAll(async () => {
    image = configure({
        dryRun: true
    });
    const res = await image(absolutePath);
    metadata = res.metadata;
    html = res.html;
});

test("do not throw error when the path is valid", () => {
    expect(() => image(absolutePath)).not.toThrow();
});

test("throws error when the path is an invalid file", async () => {
    await expect(() => image("test-content/image-nonexistent.jpeg")).rejects.toThrow();
});

test("generates (only) avif webp and jpeg by default", () => {
    expect(Object.keys(metadata).length).toBe(3);
    expect(metadata).toHaveProperty("avif");
    expect(metadata).toHaveProperty("webp");
    expect(metadata).toHaveProperty("jpeg");
});

test("generates (only) 400, 800, 1200 and 1600 by default", () => {
    const jpeg = metadata["jpeg"];
    expect(jpeg.length).toBe(4);
    expect(jpeg).toEqual(expect.arrayContaining([
        expect.objectContaining({ width: 400 }),
        expect.objectContaining({ width: 800 }),
        expect.objectContaining({ width: 1200 }),
        expect.objectContaining({ width: 1600 }),
    ]));
});

test("appends '/images/' to urls by default", () => {
    const jpeg = metadata["jpeg"];
    expect(jpeg[0].url).toMatch(/^\/images\//);
});

test("output directory == '_site/images/' by default", () => {
    const jpeg = metadata["jpeg"];
    expect(jpeg[0].outputPath).toMatch(/^_site\/images\//);
});

test("default alt text", () => {
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAccessibleName("");
});

test("setting alt text", async () => {
    const alt = "an alternative text";
    const html = (await image(absolutePath, {
        alt
    })).html;
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAccessibleName(alt);
});

test("default sizes", () => {
    const dom = new JSDOM(html).window.document;
    const picture = dom.querySelector("source");
    expect(picture.sizes).toBe("100vw");
});

test("setting sizes", async () => {
    const sizes = "(max-width: 768px) calc(100vw - 4rem), calc(768px - 4rem)";
    const html = (await image(absolutePath, {
        sizes
    })).html;
    const dom = new JSDOM(html).window.document;
    const picture = dom.querySelector("source");
    expect(picture.sizes).toBe(sizes);
});

test("default loading = 'lazy'", () => {
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAttribute("loading", "lazy");
});

test("set loading to default", async () => {
    const html = (await image(absolutePath, {
        loading: "eager"
    })).html;
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAttribute("loading", "eager");
});

test("default fetchPriority = 'auto'", () => {
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAttribute("fetchPriority", "auto");
});

test("settin fetchPriority", async () => {
    const html = (await image(absolutePath, {
        fetchPriority: "high"
    })).html;
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAttribute("fetchPriority", "high");
});

test("default width and height", () => {
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveAttribute("width");
    expect(img).toHaveAttribute("height");
});

test("no class by default", () => {
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).not.toHaveClass();
});

test("settin class", async () => {
    const classNames = "main-picure large"
    const html = (await image(absolutePath, {
        class: classNames
    })).html;
    const dom = new JSDOM(html).window.document;
    const img = getByRole(dom, "img");
    expect(img).toHaveClass(classNames);
});