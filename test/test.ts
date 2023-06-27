import {
  resize,
} from "../mod.ts";

const content = await Deno.readFile("./test/test.jpg");

const content2 = await resize(
  content,
  "webp",
  100,
  100,
  80,
);

await Deno.writeFile("./test/test.webp", content2);
