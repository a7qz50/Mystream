const { NodeMediaServer } = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg', // مسار برنامج FFmpeg في حاسوبك أو السيرفر
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: 'rtmp://a.rtmp.youtube.com/live2/مفتاح_البث_الخاص_بك' // هنا يتم توجيه البث تلقائياً ليوتيوب
      }
    ]
  }
};

let nms = new NodeMediaServer(config);
nms.run();
console.log("سيرفر البث الوسيط يعمل الآن على المنفذ 1935 و 8000...");
