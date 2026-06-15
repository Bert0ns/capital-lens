import * as THREE from 'three';

export function generateNetworkGeometry(nodeCount: number, radius: number) {
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const pos = [];

  // Generate nodes clustered towards the center using a sphere distribution
  for (let i = 0; i < nodeCount; i++) {
    const u = random();
    const v = random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    // Power of 1/3 concentrates nodes towards the center for a dense core
    const r = Math.pow(random(), 1 / 3) * radius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    pos.push(new THREE.Vector3(x, y, z));
  }

  const linePoints = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      // Connect nodes that are close to each other to form the "portfolio network"
      if (pos[i].distanceTo(pos[j]) < 3.0) {
        linePoints.push(pos[i], pos[j]);
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);

  // Convert Vector3[] to Float32Array for high-performance Points rendering
  const positionsArray = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    positionsArray[i * 3] = pos[i].x;
    positionsArray[i * 3 + 1] = pos[i].y;
    positionsArray[i * 3 + 2] = pos[i].z;
  }

  return { positionsArray, lineGeometry };
}
