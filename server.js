const NodeMediaServer = require('node-media-server');

// إعدادات خادم الـ RTMP و HTTP
const config = {
  rtmp: {
    port: 1935, // المنفذ الأساسي لبروتوكول RTMP (يستخدمه OBS)
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000, // منفذ الويب لتحويل البث إلى HLS للمشاهدة عبر المتصفح
    allow_origin: '*'
  }
};

let nms = new NodeMediaServer(config);

// أحداث السيرفر (للتحقق من البث)
nms.on('preConnect', (id, args) => {
  console.log('[NodeMS] محاولة اتصال جديدة من جهاز:', id);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeMS] تم الاتصال بنجاح:', id);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeMS] انقطع الاتصال:', id);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log(`[NodeMS] بدأ البث في المسار: ${StreamPath}`);
  // يمكنك هنا إضافة شرط للتحقق من "مفتاح البث" (Stream Key)
  // مثال: إذا كان StreamPath لا يحتوي على المفتاح الصحيح، يمكنك قطع الاتصال
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(`[NodeMS] توقف البث من المسار: ${StreamPath}`);
});

// تشغيل السيرفر
nms.run();
console.log('----------------------------------------------------');
console.log('🚀 خادم البث يعمل الآن!');
console.log('📡 رابط الـ RTMP للاستخدام في OBS هو: rtmp://localhost/live');
console.log('📺 رابط المشاهدة (HLS) هو: http://localhost:8000/live/[STREAM_KEY]/index.m3u8');
console.log('----------------------------------------------------');
