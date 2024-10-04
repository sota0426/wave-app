// utils.ts
export const getRotatedCoordinates = (x: number, y: number, angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: x * Math.cos(radians),
      y: y,
    };
  };
  
  export const getAngleCoordinates = (angle: number, radius: number) => {
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return { x, y };
  };
  
  export const calculatePoints = (
    numPoints: number,
    time: number,
    period: number,
    radius: number,
    rotationAngle: number,
    offsetPeriod: number
  ) => {
    return Array.from({ length: numPoints }, (_, i) => {
      const delay = (i / numPoints) * period;
      const effectiveTime = time > delay + offsetPeriod ? time - delay : 0;
  
      const angle =
        effectiveTime > 0 ? -(effectiveTime / period) * 2 * Math.PI : 0;
  
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const rotated = getRotatedCoordinates(x, y, rotationAngle);
  
      return { x: rotated.x, y: rotated.y, angle };
    });
  };
  
  export const calculateVelocityAndAcceleration = (
    time: number,
    period: number,
    radius: number,
    rotationAngle: number
  ) => {
    const omega = (2 * Math.PI) / period;
    const angle = -(time / period) * 2 * Math.PI;
    const v_x = omega * radius * Math.sin(angle);
    const v_y = omega * radius * Math.cos(angle);
    const a_x = -omega * omega * radius * Math.cos(angle);
    const a_y = -omega * omega * radius * Math.sin(angle);
  
    // 回転角度の考慮
    const rotatedVelocity = getRotatedCoordinates(v_x, v_y, rotationAngle);
    const rotatedAcceleration = getRotatedCoordinates(a_x, a_y, rotationAngle);
  
    return {
      velocity: rotatedVelocity,
      acceleration: rotatedAcceleration,
    };
  };
  