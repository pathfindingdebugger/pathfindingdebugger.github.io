
const cross = a => b => ({x:a.y*b.z - b.y*a.z, y:a.z*b.x - a.x*b.z, z:a.x*b.y - a.y*b.x });
const magnitude = a => Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
const normalise = a => {const mag = magnitude(a); return {x:a.x/mag, y:a.y/mag, z:a.z/mag}};
const multiply = vec => n => ({x:vec.x*n, y:vec.y*n, z:vec.z*n});
