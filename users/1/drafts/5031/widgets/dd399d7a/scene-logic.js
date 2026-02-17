const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshStandardMaterial({ 
  color: theme === 'dark' ? 0x00ffcc : 0x0066ff,
  roughness: 0.3,
  metalness: 0.8
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(50, 50, 50);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.z = 40;

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  torusKnot.rotation.x += 0.01;
  torusKnot.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

return () => {
  cancelAnimationFrame(animationId);
  renderer.dispose();
  geometry.dispose();
  material.dispose();
  container.removeChild(renderer.domElement);
};