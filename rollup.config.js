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
const dependencies = pkg.dependencies;
const external = Object.keys(dependencies);
config.external = [...external, "@deboxsoft/svelte-components"];
export default config;
