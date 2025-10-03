const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminWebp = require('imagemin-webp');

module.exports = {
  // JPEG optimization
  jpeg: {
    plugins: [
      imageminMozjpeg({
        quality: 85,
        progressive: true
      })
    ]
  },

  // PNG optimization
  png: {
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 1
      })
    ]
  },

  // SVG optimization
  svg: {
    plugins: [
      imageminSvgo({
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeUselessStrokeAndFill: false,
                removeEmptyAttrs: false
              }
            }
          }
        ]
      })
    ]
  },

  // WebP conversion
  webp: {
    plugins: [
      imageminWebp({
        quality: 85,
        method: 6
      })
    ]
  },

  // All formats
  all: {
    plugins: [
      imageminMozjpeg({
        quality: 85,
        progressive: true
      }),
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 1
      }),
      imageminSvgo({
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                removeUselessStrokeAndFill: false,
                removeEmptyAttrs: false
              }
            }
          }
        ]
      }),
      imageminWebp({
        quality: 85,
        method: 6
      })
    ]
  }
};
