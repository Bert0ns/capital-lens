import { getCoordinates } from '@/lib/utils/Coordinates';

describe('Coordinates Utils', () => {
  it('calculates 3D vector correctly for equator and prime meridian (0, 0)', () => {
    const radius = 10;
    const vec = getCoordinates(0, 0, radius);

    // phi = 90 * PI/180 = PI/2. sin(PI/2) = 1, cos(PI/2) = 0
    // theta = 180 * PI/180 = PI. sin(PI) = 0, cos(PI) = -1
    // x = -(10 * 1 * -1) = 10
    // z = 10 * 1 * 0 = 0
    // y = 10 * 0 = 0

    expect(vec.x).toBeCloseTo(10);
    expect(vec.y).toBeCloseTo(0);
    expect(vec.z).toBeCloseTo(0);
  });

  it('calculates 3D vector correctly for North Pole (90, 0)', () => {
    const radius = 10;
    const vec = getCoordinates(90, 0, radius);

    // phi = 0 * PI/180 = 0. sin(0) = 0, cos(0) = 1
    // theta = PI.
    // x = 0, z = 0, y = 10

    expect(vec.x).toBeCloseTo(0);
    expect(vec.y).toBeCloseTo(10);
    expect(vec.z).toBeCloseTo(0);
  });

  it('calculates 3D vector correctly for South Pole (-90, 0)', () => {
    const radius = 10;
    const vec = getCoordinates(-90, 0, radius);

    // phi = 180 * PI/180 = PI. sin(PI) = 0, cos(PI) = -1
    // y = 10 * -1 = -10

    expect(vec.x).toBeCloseTo(0);
    expect(vec.y).toBeCloseTo(-10);
    expect(vec.z).toBeCloseTo(0);
  });
});
