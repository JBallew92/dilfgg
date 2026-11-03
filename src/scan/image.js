// Shrinks a phone photo before upload and finds the date it was taken.

const MAX_SIDE = 2000;

export async function shrinkPhoto(file) {
  const bitmap = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
}

function loadImage(file) {
  if (window.createImageBitmap) {
    // imageOrientation keeps portrait phone photos upright.
    return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => loadWithImg(file));
  }
  return loadWithImg(file);
}

function loadWithImg(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Reads DateTimeOriginal from a JPEG's EXIF data. Returns 'YYYY-MM-DD' or ''.
export async function photoDate(file) {
  try {
    const view = new DataView(await file.slice(0, 128 * 1024).arrayBuffer());
    return exifDate(view);
  } catch {
    return '';
  }
}

export function exifDate(view) {
  if (view.getUint16(0) !== 0xffd8) return '';
  let off = 2;
  while (off + 4 < view.byteLength) {
    const marker = view.getUint16(off);
    const size = view.getUint16(off + 2);
    if (marker === 0xffe1 && view.getUint32(off + 4) === 0x45786966) return tiffDate(view, off + 10);
    if ((marker & 0xff00) !== 0xff00) return '';
    off += 2 + size;
  }
  return '';
}

function tiffDate(view, start) {
  const little = view.getUint16(start) === 0x4949;
  const u16 = (o) => view.getUint16(start + o, little);
  const u32 = (o) => view.getUint32(start + o, little);
  const readDir = (dirOff, wanted) => {
    const count = u16(dirOff);
    for (let i = 0; i < count; i++) {
      const entry = dirOff + 2 + i * 12;
      if (u16(entry) === wanted) return entry;
    }
    return -1;
  };
  const ifd0 = u32(4);
  const exifPtr = readDir(ifd0, 0x8769);
  const candidates = [];
  if (exifPtr !== -1) candidates.push(readDir(u32(exifPtr + 8), 0x9003)); // DateTimeOriginal
  candidates.push(readDir(ifd0, 0x0132)); // DateTime
  for (const entry of candidates) {
    if (entry === -1) continue;
    const at = start + u32(entry + 8);
    let s = '';
    for (let i = 0; i < 10; i++) s += String.fromCharCode(view.getUint8(at + i));
    const m = /^(\d{4}):(\d{2}):(\d{2})$/.exec(s);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return '';
}

// Today's date in the phone's own time zone, as 'YYYY-MM-DD'.
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
