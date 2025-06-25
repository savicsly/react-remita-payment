import terser from "@rollup/plugin-terser";
import fs from "fs";
import path from "path";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve("./package.json"), "utf-8")
);

export default () => {
  if (process.env.ROLLUP_BUILD_TYPE === "types") {
    return {
      input: "dist/index.d.ts",
      output: [{ file: "dist/index.d.ts", format: "esm" }],
      plugins: [dts()],
    };
  }
  return {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      typescript({
        useTsconfigDeclarationDir: true,
      }),
      terser(),
    ],
    external: ["react", "react-dom"],
  };
};
