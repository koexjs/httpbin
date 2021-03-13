import { Context } from '@koex/core';
import * as os from 'os';
import * as fs from 'fs';
import { join, extname } from 'path';
import * as imagemin from 'imagemin';
import * as imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import * as imageminSvgo from 'imagemin-svgo';
import * as imageminGifsicle from 'imagemin-gifsicle';
import * as imageminMozjpeg from 'imagemin-mozjpeg';
import * as imageminWebp from 'imagemin-webp';

const { extendDefaultPlugins } = require('svgo');

const CLEAN_TIMEOUT = 30 * 60 * 1000;

async function compress(filepath: string, quality: number = 75) {
  const files = await imagemin([filepath], {
		destination: join(os.tmpdir(), 'imagemin'),
		plugins: [
      imageminGifsicle(),
			imageminMozjpeg({
        quality,
      }),
			imageminPngquant({
				quality: [0.1, quality / 100],
			}),
      imageminSvgo({
        plugins: extendDefaultPlugins([
          { name: 'removeViewBox', active: false },
        ]),
      }),
      imageminWebp({
        quality,
      }),
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
  const quality = +ctx.query.quality || 75;
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
    const targetPath = await compress(sourcePath, quality);

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
  const file = ctx.cache.get(key);
  if (!file) {
    ctx.status = 404;
    return ctx.throw(404, {
      code: 4041000,
      message: `Image Minified Invalid(${id})`,
    });
  }

  const { type, targetPath } = file;
  await ctx.resource(targetPath, type);
}

export default {
  create,
  get,
};