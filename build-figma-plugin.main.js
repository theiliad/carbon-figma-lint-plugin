require("dotenv").config();

module.exports = function buildFigma(buildOptions) {
  return {
    ...buildOptions,
    platform: "browser",
  };
};
