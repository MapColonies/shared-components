import path from "path";
import { defineConfig } from "vite";
import pluginReact from "@vitejs/plugin-react";

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export const getBaseConfig = ({ plugins = [], lib }) =>
    defineConfig({
        plugins: [pluginReact(), ...plugins],
        build: {
            lib,
            rollupOptions: {
                external: isExternal,
                output: {
                    globals: {
                        react: "React"
                    }
                }
            }
        }
    });
