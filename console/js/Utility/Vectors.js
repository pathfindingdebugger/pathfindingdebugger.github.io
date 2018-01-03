
const cross = a => b => ({x:a.y*b.z - b.y*a.z, y:a.z*b.x - a.x*b.z, z:a.x*b.y - a.y*b.x });
const magnitude = a => Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
const normalise = a => {const mag = magnitude(a); return {x:a.x/mag, y:a.y/mag, z:a.z/mag}};
const multiply = vec => n => ({x:vec.x*n, y:vec.y*n, z:vec.z*n});
const divide = v1 => v2 => ({x:v1.x/v2.x, y:v1.y/v2.y, z:v2.z !== 0 ? v1.z/v2.z:0});
const add = v1 => v2 => ({x:v1.x + v2.x, y: v1.y + v2.y, z:v1.z + v2.z});
const sub = origin => destination  => ({x:destination.x - origin.x, y: destination.y - origin.y, z: destination.z - origin.z});
const vector3 = v2 => ({x:v2.x, y:v2.y, z:0});
const equal =  v1 => v2 => v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
