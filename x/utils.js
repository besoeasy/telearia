function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

const ariaconfig = [
  "--retry-wait=240",
  "--continue=true",
  "--seed-ratio=2",
  "--seed-time=1440",
  "--enable-rpc",
  "--rpc-listen-all",
  "--rpc-allow-origin-all",
  "--rpc-listen-port=6800",
  "--enable-dht=true",
  "--dht-listen-port=6881-6999",
  "--dht-entry-point=router.bittorrent.com:6881",
  "--dht-entry-point6=router.bittorrent.com:6881",
  "--dht-entry-point6=router.utorrent.com:6881",
  "--dht-entry-point6=dht.transmissionbt.com:6881",
  "--dht-entry-point6=dht.aelitis.com:6881",
  "--bt-enable-lpd=true",
];

module.exports = { bytesToSize, ariaconfig };
