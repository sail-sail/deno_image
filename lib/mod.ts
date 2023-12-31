let libSuffix = "";
switch (Deno.build.os) {
  case "windows":
    libSuffix = "dll";
    break;
  case "darwin":
    libSuffix = "dylib";
    break;
  default:
    libSuffix = "so";
    break;
}

// deno-lint-ignore no-explicit-any
function readPointer(v: any): Uint8Array {
  const ptr = new Deno.UnsafePointerView(v)
  const lengthBe = new Uint8Array(4)
  const view = new DataView(lengthBe.buffer)
  ptr.copyInto(lengthBe, 0)
  const buf = new Uint8Array(view.getUint32(0))
  ptr.copyInto(buf, 4)
  return buf
}

const libName = `./lib/image.${ libSuffix }`;

const {
  symbols: image,
} = Deno.dlopen(
  libName,
  {
    "resize": {
      parameters: [
        "buffer",
        "usize",
        "buffer",
        "usize",
        "u32",
        "u32",
        "u8",
      ],
      result: "buffer",
      nonblocking: true,
    },
  } as const,
);

/**
 * 压缩图片
 * @param content 图片的二进制数据
 * @param format 返回的图片格式, 默认为 webp, 可选值为 jpeg, png, webp
 * @param width 需要压缩的宽度, 默认为 0, 即不压缩, 跟height比较, 以较大长度为准
 * @param height 需要压缩的高度, 默认为 0, 即不压缩, 跟width比较, 以较大长度为准
 * @param quality 压缩的质量, 默认为 80, 范围为 0 ~ 100
 * @returns 返回压缩后的图片二进制数据
 */
export async function resize(
  content: Uint8Array,
  format = "webp",
  width = 0,
  height = 0,
  quality = 80,
) {
  const formatBuf = new TextEncoder().encode(format);
  const rawResult = await image.resize(
    content,
    content.byteLength,
    formatBuf,
    formatBuf.byteLength,
    width,
    height,
    quality,
  );
  const content2 = readPointer(rawResult);
  return content2;
}
