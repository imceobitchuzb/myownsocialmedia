import * as THREE from 'three';

/**
 * Procedurally generates a high-resolution (2048x1024) realistic equirectangular Earth texture
 * with dark-mode editorial styling (graphite oceans, defined continental landmasses,
 * latitude/longitude graticules, and glowing coastlines).
 */
export function createEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Deep Space / Ocean Base
  ctx.fillStyle = '#07090E';
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean depth gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0A0D15');
  oceanGrad.addColorStop(0.5, '#06080D');
  oceanGrad.addColorStop(1, '#0A0D15');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Graticule (Lat / Lng Grid lines)
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
  ctx.lineWidth = 1;

  // Latitude parallels (every 15 degrees)
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Longitude meridians (every 15 degrees)
  for (let lng = -180; lng <= 180; lng += 15) {
    const x = ((lng + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator line with slight highlight
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Helper: converts lat/lng degrees into canvas (x, y) pixels
  function toXY(lng: number, lat: number): [number, number] {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  }

  function drawLandmass(points: [number, number][]) {
    if (!ctx || points.length < 3) return;
    ctx.beginPath();
    const [startLng, startLat] = points[0];
    const [startX, startY] = toXY(startLng, startLat);
    ctx.moveTo(startX, startY);

    for (let i = 1; i < points.length; i++) {
      const [lng, lat] = points[i];
      const [px, py] = toXY(lng, lat);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#141722';
    ctx.fill();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 3. Realistic Continental Outlines (Equirectangular Polygon Coordinates)

  // Eurasia (Europe + Asia + Central Asia / Uzbekistan)
  drawLandmass([
    [-10, 36], [-8, 44], [-4, 48], [2, 51], [8, 55], [10, 58], [20, 60], [28, 70],
    [40, 68], [60, 74], [80, 73], [105, 78], [130, 72], [170, 67], [180, 66],
    [170, 60], [160, 55], [142, 50], [130, 42], [122, 38], [120, 32], [110, 20],
    [105, 10], [98, 10], [90, 22], [80, 10], [75, 8], [70, 22], [62, 25],
    [58, 24], [52, 26], [45, 13], [44, 28], [36, 32], [35, 36], [28, 41],
    [22, 40], [15, 38], [12, 44], [3, 43], [-5, 36], [-10, 36]
  ]);

  // Central Asia & Caspian Insets
  drawLandmass([
    [50, 40], [58, 45], [68, 45], [75, 42], [70, 38], [64, 38], [56, 36], [50, 40]
  ]);

  // Africa
  drawLandmass([
    [-6, 36], [-17, 30], [-17, 15], [-12, 5], [0, 5], [8, 4], [10, -5],
    [12, -15], [18, -34], [28, -34], [32, -28], [40, -10], [51, 10], [44, 12],
    [38, 22], [32, 31], [25, 32], [12, 37], [0, 36], [-6, 36]
  ]);

  // Madagascar
  drawLandmass([
    [44, -12], [50, -14], [48, -25], [44, -25], [44, -12]
  ]);

  // North America
  drawLandmass([
    [-168, 65], [-160, 71], [-140, 70], [-120, 70], [-90, 70], [-80, 62],
    [-65, 60], [-60, 48], [-70, 43], [-75, 35], [-80, 25], [-82, 24],
    [-88, 30], [-97, 26], [-97, 20], [-88, 15], [-84, 10], [-78, 8],
    [-80, 9], [-92, 16], [-105, 20], [-110, 24], [-117, 32], [-124, 38],
    [-125, 48], [-130, 54], [-140, 60], [-160, 58], [-168, 65]
  ]);

  // Greenland
  drawLandmass([
    [-50, 60], [-40, 65], [-20, 75], [-20, 82], [-40, 83], [-55, 80],
    [-60, 75], [-50, 60]
  ]);

  // South America
  drawLandmass([
    [-75, 10], [-60, 10], [-50, 0], [-35, -5], [-36, -10], [-40, -22],
    [-50, -30], [-55, -40], [-65, -55], [-75, -50], [-72, -40], [-70, -20],
    [-78, -5], [-80, 2], [-75, 10]
  ]);

  // Australia
  drawLandmass([
    [114, -22], [122, -15], [130, -12], [136, -12], [142, -10], [150, -22],
    [153, -28], [150, -38], [140, -38], [135, -34], [125, -34], [115, -34],
    [114, -22]
  ]);

  // Japan
  drawLandmass([
    [130, 32], [132, 34], [136, 35], [140, 40], [142, 44], [144, 44],
    [141, 38], [138, 36], [132, 32], [130, 32]
  ]);

  // British Isles & Ireland
  drawLandmass([
    [-5, 50], [1, 52], [0, 58], [-4, 58], [-5, 55], [-5, 50]
  ]);
  drawLandmass([
    [-10, 52], [-6, 52], [-6, 55], [-10, 54], [-10, 52]
  ]);

  // Indonesia & Philippines
  drawLandmass([
    [95, 5], [105, -5], [115, -8], [125, -8], [115, -6], [100, 0], [95, 5]
  ]);
  drawLandmass([
    [110, -3], [118, -3], [118, 4], [110, 4], [110, -3]
  ]);
  drawLandmass([
    [120, 10], [126, 10], [124, 18], [120, 15], [120, 10]
  ]);

  // Antarctica
  drawLandmass([
    [-180, -75], [180, -75], [180, -90], [-180, -90], [-180, -75]
  ]);

  // 4. Subtle Digital Matrix Dots in Landmasses
  ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
  for (let y = 100; y < height - 100; y += 16) {
    for (let x = 0; x < width; x += 16) {
      // Sample pixel from our canvas: if it's on land (#141722), add a digital radar point
      const p = ctx.getImageData(x, y, 1, 1).data;
      if (p[0] === 0x14 && p[1] === 0x17 && p[2] === 0x22) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Converts spherical latitude and longitude (in degrees) to 3D Cartesian coordinates.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}
