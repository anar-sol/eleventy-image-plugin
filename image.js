const eleventyImage = require("@11ty/eleventy-img");

function configure(config) {
    return async function(filePath, options) {
        config = {...{
            widths: [400, 800, 1200, 1600],
            formats: ["avif", "webp", "jpeg"],
            urlPath: "/images/",
            outputDir: "_site/images/",
            dryRun: false
        },...config };

        const metadata = await eleventyImage(filePath, config);

        const html = eleventyImage.generateHTML(metadata, {...{
            alt: "",
            sizes: "100vw",
            loading: "lazy",
            fetchPriority: "auto",
        }, ...options});

        return { html, metadata };
    };
}

module.exports = { configure };
