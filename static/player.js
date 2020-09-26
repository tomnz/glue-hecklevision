window.addEventListener('load', () => {
  const options = {
    autoplay: 'play',
    controls: true,
    fill: true,
    responsive: true,
    liveui: true,
    techOrder: ['chromecast', 'html5'],
    chromecast: {
      requestTitleFn: () => 'Glue Hecklevision',
    },
    html5: {
      hls: {
        blacklistDuration: 10,
        bandwidth: 1128000,
        useBandwidthFromLocalStorage: true,
        overrideNative: !videojs.browser.IS_ANY_SAFARI,
        smoothQualityChange: true,
      },
      nativeAudioTracks: !videojs.browser.IS_ANY_SAFARI,
      nativeVideoTracks: !videojs.browser.IS_ANY_SAFARI,
    },
    plugins: {
      chromecast: {
        buttonPositionIndex: -2,
        // Glue Cast app
        receiverAppID: 'B42E7286',
      },
      airPlay: {},
    },
  };

  const srcUrl = new URL(window.location.href);
  srcUrl.pathname = '/live/movie.m3u8';

  videojs(document.querySelector('#video'), options, function() {
    this.src({
      src: 'https://stream-remote.tom.kiwi/live/movie.m3u8',
      type: 'application/x-mpegURL',
    });
    this.qualityLevels();
    this.hlsQualitySelector({
      displayCurrentQuality: true,
    });
  });
});
