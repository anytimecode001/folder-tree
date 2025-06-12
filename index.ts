import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import * as fs from "fs";
import * as path from "path";

const contentDir = path.join(__dirname, "content");

const app = new Hono();

app.use("*", serveStatic({ root: "./public" }));

app.get("/", (c) => c.redirect("/public/index.html"));

// 新增路由来获取 content 文件夹的目录结构
app.get("/api/content-structure", (c) => {
  const getDirectoryStructure: any = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.map((entry: any) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return {
          name: entry.name,
          type: "directory",
          path: fullPath,
          children: getDirectoryStructure(fullPath),
        };
      } else {
        const stats = fs.statSync(fullPath);
        return {
          name: entry.name,
          type: "file",
          path: fullPath,
          size: stats.size,
        };
      }
    });
  };
  const structure = getDirectoryStructure(contentDir);
  return c.json(structure);
});

const port = process.env.PORT || 3000;
const ServeOptions = {
  fetch: app.fetch,
  port: Number(port),
};

serve(ServeOptions, () => {
  console.log(`Server running on http://localhost:${port}`);
});
