module.exports = function buildFigma(buildOptions) {
  return {
    ...buildOptions,
    platform: "browser",
  };
};
