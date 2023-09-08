const { configure } = require("./image.js");
const path = require("path");

function relativeTo(relativeFilePath, inputPath) {
    let split = inputPath.split("/");
    split.pop();
    return path.resolve(split.join(path.sep), relativeFilePath);
}

module.exports = function(eleventyConfig, pluginConfig) {
    const image = configure(pluginConfig);
    eleventyConfig.addAsyncShortcode("image", async function(filePath, options) {
        return (await image(filePath, options)).html;
    });

    eleventyConfig.addFilter("relativeTo", (relativeFilePath, inputPath) => {
		return relativeTo(relativeFilePath, inputPath);
	});
};