import { Context } from '@koex/core';
import * as os from 'os';
import * as fs from 'fs';
import { join, extname } from 'path';
import * as imagemin from 'imagemin';
import * as imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

const CLEAN_TIMEOUT = 30 * 60 * 1000;

async function compress(filepath: string) {
  const files = await imagemin([filepath], {
		destination: join(os.tmpdir(), 'imagemin'),
		plugins: [
			imageminJpegtran(),
			imageminPngquant({
				quality: [0.6, 0.8],
			})
		]
	});

  return files[0].destinationPath;
}

async function getSize(filepath: string) {
  const stat = await fs.promises.stat(filepath);
  return stat.size;
}

async function rm(filepath: string) {
  try {
    await fs.promises.unlink(filepath);
  } catch (error) {
    //
  }
}

function schedulerClean(source: string, target: string) {
  setTimeout(async () => {
    await rm(source);
    await rm(target);
  }, CLEAN_TIMEOUT);
}

export async function create(ctx: Context) {
  const sourceFile = ctx.request.files['file'];
  if (!sourceFile) {
    ctx.throw(400, {
      code: 4002000,
      message: 'file should be provided',
    });
  }

  const { name, type, hash, size, path: sourcePath } = sourceFile as any;
  // const ext = extname(name);
  const id = hash;

  try {
    const targetPath = await compress(sourcePath);

    const key = `imagemin/${id}`;
    ctx.cache.set(key, { name, type, sourcePath, targetPath });
    
    // cleaner
    schedulerClean(sourcePath, targetPath);

    const _size = await getSize(targetPath);
  
    await ctx.json({
      id,
      name,
      size: {
        before: size,
        after: _size,
      },
      url: `/image/minify/${id}`,
    });
  } catch (error) {
    await rm(sourcePath);

    throw error;
  }
}

export async function get(ctx: Context) {
  const { id } = ctx.params;

  if (!id) {
    return await ctx.render('./view/imagemin.html', {
      title: 'Image Minify',
    });
  }

  const key = `imagemin/${id}`;
  const { type, targetPath } = ctx.cache.get(key) || {};

  await ctx.resource(targetPath, type);
}

export default {
  create,
  get,
};