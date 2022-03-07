import bundle from "@nurdiansyah/rollup/configs/module.config";
import path from "path";
import fs from "fs-extra";

const config = bundle(
  {
    name: "moduleClient",
    input: "src/index.ts",
    output: "index.js"
  },
  {
    nodeResolveOptions: {
      preferBuiltins: true
    }
  }
);
const pkg = fs.readJsonSync(path.resolve("package.json"));
const external = Object.keys(pkg.dependencies);
const devExternal = Object.keys(pkg.devDependencies);
config.external = [...external, ...devExternal];
export default config;
