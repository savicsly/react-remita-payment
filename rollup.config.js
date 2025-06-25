import { terser } from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";

export default async () => {
  const packageJson = await import("./package.json", {
    assert: { type: "json" },
  }).then((m) => m.default || m);
  return [
    {
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
    },
    {
      input: "dist/index.d.ts",
      output: [{ file: "dist/index.d.ts", format: "esm" }],
      plugins: [dts()],
    },
  ];
};
