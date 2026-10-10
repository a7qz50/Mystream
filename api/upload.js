const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// إعداد التخزين المؤقت للملفات المرفوعة
const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 100 * 1024 * 1024 } // حد أقصى 100 ميجابايت للتجربة
});

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // تشغيل مكتبة Multer لاستقبال الملف
    await runMiddleware(req, res, upload.single('video'));

    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم العثور على أي ملف فيديو مرفوع.' });
    }

    const inputPath = req.file.path;
    const outputDir = path.join('/tmp', 'hls_' + Date.now());
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPlaylist = path.join(outputDir, 'playlist.m3u8');

    // معالجة الفيديو باستخدام FFmpeg لتحويله إلى HLS (m3u8)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls'
        ])
        .output(outputPlaylist)
        .on('end', () => resolve())
        .on('err', (err) => reject(err))
        .run();
    });

    // تنظيف ملف الفيديو الأصلي المؤقت
    fs.unlinkSync(inputPath);

    // إرجاع الرابط الوهمي أو رابط الاستضافة (ملاحظة: على Vercel ستحتاج لرفع الملفات الناتجة لخدمة سحابية مثل AWS S3 أو تخزين مؤقت لعرضها)
    return res.status(200).json({
      success: true,
      message: 'تم تحويل الفيديو بنجاح!',
      url: `/api/stream?dir=${path.basename(outputDir)}&file=playlist.m3u8`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الفيديو: ' + error.message });
  }
};
          
