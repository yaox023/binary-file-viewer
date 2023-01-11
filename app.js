#!/usr/bin/env node

import fs from "fs";
import express from "express";
import cors from "cors";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.log("Usage: bv <file-path>");
  process.exit(1);
}

function start(fd) {
  const app = express();
  app.use(express.static(path.join(__dirname, "dist")));

  if (process.env.VITE_MODE === "development") {
    app.use(cors());
  }

  app.get("/meta", async (req, res) => {
    fs.fstat(fd, (err, stats) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(stats);
      res.send({ size: stats.size, path: argv[0] });
    });
  });

  app.get("/bytes", async (req, res) => {
    const offset = parseInt(req.query.offset);
    const length = parseInt(req.query.length);

    fs.read(
      fd,
      Buffer.allocUnsafe(length),
      0,
      length,
      offset,
      (err, bytesRead, buffer) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        res.send(buffer.subarray(0, bytesRead));
      }
    );
  });

  const port =
    process.env.VITE_MODE === "development" ? process.env.VITE_PORT : 0;
  const server = app.listen(port, () => {
    console.log(`http://localhost:${server.address().port}`);
  });
}

function main() {
  fs.open(argv[0], "r", (err, fd) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    start(fd);
  });
}

main();
