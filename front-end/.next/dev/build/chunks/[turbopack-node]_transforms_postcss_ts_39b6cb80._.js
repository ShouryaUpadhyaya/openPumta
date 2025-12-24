module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/front-end/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/b1e26__pnpm_9c88fb82._.js",
  "chunks/[root-of-the-server]__151cb2cc._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/front-end/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];