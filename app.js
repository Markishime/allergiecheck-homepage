import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';
import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/framer-motion@12.23.6/+esm';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#scene');
const hero = document.querySelector('.hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('motion-ready');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);
const group = new THREE.Group();
scene.add(group);

// A sculpted nasal-spray silhouette replaces the abstract orb: product-relevant, quiet, and lit like a real object.
const spray = new THREE.Group();
const coral = new THREE.MeshPhysicalMaterial({ color: 0xeb6d5b, roughness: 0.24, metalness: 0.04, clearcoat: 0.9, clearcoatRoughness: 0.12, iridescence: .32, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 380] });
const cream = new THREE.MeshPhysicalMaterial({ color: 0xfffaf0, roughness: 0.3, metalness: 0.05, clearcoat: 0.42 });
const teal = new THREE.MeshPhysicalMaterial({ color: 0x277d7d, roughness: 0.2, metalness: 0.08, clearcoat: 0.68, iridescence: .16 });
const metal = new THREE.MeshPhysicalMaterial({ color: 0xe5dfd0, roughness: 0.22, metalness: .58, clearcoat: .45 });
const bottle = new THREE.Mesh(new THREE.CapsuleGeometry(.56, 1.68, 12, 40), coral);
spray.add(bottle);
const label = new THREE.Mesh(new THREE.PlaneGeometry(.78, .78), new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: .48 }));
label.position.set(0, -.14, .56);
spray.add(label);
const labelMark = new THREE.Mesh(new THREE.PlaneGeometry(.42, .038), new THREE.MeshBasicMaterial({ color: 0x277d7d }));
labelMark.position.set(0, .08, .568);
spray.add(labelMark);
const collar = new THREE.Mesh(new THREE.CylinderGeometry(.43, .5, .22, 40), cream);
collar.position.y = 1.06;
spray.add(collar);
const pump = new THREE.Mesh(new THREE.CylinderGeometry(.29, .34, .62, 40), cream);
pump.position.y = 1.42;
spray.add(pump);
const nozzleBase = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, .42, 32), teal);
nozzleBase.rotation.z = Math.PI / 2;
nozzleBase.position.set(.38, 1.62, 0);
spray.add(nozzleBase);
const nozzleTip = new THREE.Mesh(new THREE.CylinderGeometry(.07, .13, .45, 32), metal);
nozzleTip.rotation.z = Math.PI / 2;
nozzleTip.position.set(.77, 1.62, 0);
spray.add(nozzleTip);
const trigger = new THREE.Mesh(new THREE.TorusGeometry(.22, .045, 12, 32, Math.PI), cream);
trigger.rotation.set(0, 0, Math.PI / 2);
trigger.position.set(-.22, 1.28, 0);
spray.add(trigger);
spray.rotation.set(.14, -.4, -.22);
group.add(spray);

const glowCanvas = document.createElement('canvas');
glowCanvas.width = glowCanvas.height = 256;
const glowContext = glowCanvas.getContext('2d');
const glowGradient = glowContext.createRadialGradient(128, 128, 0, 128, 128, 128);
glowGradient.addColorStop(0, 'rgba(255,229,168,.62)');
glowGradient.addColorStop(.32, 'rgba(255,194,113,.2)');
glowGradient.addColorStop(1, 'rgba(255,194,113,0)');
glowContext.fillStyle = glowGradient;
glowContext.fillRect(0, 0, 256, 256);
const bloom = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), color: 0xffd28a, transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false }));
bloom.position.set(-.12, .22, -1.4);
bloom.scale.set(5.5, 5.5, 1);
spray.add(bloom);

// A restrained animated mist makes the object feel like a spray device rather than a static prop.
const mist = new THREE.Group();
mist.position.set(1.06, 1.62, 0);
const mistMaterials = [];
[-.15, 0, .14].forEach((offset, index) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, offset, 0),
    new THREE.Vector3(.42, offset * .42 + Math.sin(index) * .045, -.04),
    new THREE.Vector3(.94, offset * .28 + (index - 1) * .12, -.1),
    new THREE.Vector3(1.52, offset * .1 + (index - 1) * .2, -.18),
  ]);
  const material = new THREE.MeshBasicMaterial({ color: index === 1 ? 0xfff3d3 : 0xa8ece2, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false });
  mistMaterials.push(material);
  mist.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, .016, 8, false), material));
});
spray.add(mist);
const productLight = new THREE.PointLight(0xffd89a, 4.5, 5);
productLight.position.set(-.5, 1.3, 1.4);
spray.add(productLight);

const pollenGrains = [];
const grainMaterials = [
  new THREE.MeshPhysicalMaterial({ color: 0xf7dc9b, roughness: .42, metalness: 0, transparent: true, opacity: .62, clearcoat: .3 }),
  new THREE.MeshPhysicalMaterial({ color: 0xaee7da, roughness: .35, metalness: .04, transparent: true, opacity: .48, clearcoat: .4 }),
];
for (let index = 0; index < 34; index += 1) {
  const grain = new THREE.Mesh(new THREE.IcosahedronGeometry(.055 + Math.random() * .08, 2), grainMaterials[index % grainMaterials.length]);
  const radius = 1.4 + Math.random() * 2.5;
  const angle = Math.random() * Math.PI * 2;
  grain.position.set(Math.cos(angle) * radius, (Math.random() - .5) * 4.4, -1.5 - Math.random() * 2);
  grain.userData = { phase: Math.random() * Math.PI * 2, speed: .24 + Math.random() * .35, baseline: grain.position.y };
  pollenGrains.push(grain);
  group.add(grain);
}

// Independent environmental layers give the hero a sense of air, depth, and season beyond the device itself.
const atmosphere = new THREE.Group();
scene.add(atmosphere);
const airflowMaterials = [];
[-1.35, -.55, .4, 1.2].forEach((offset, index) => {
  const current = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.7, offset, -.8),
    new THREE.Vector3(-2.3, offset + (index % 2 ? .38 : -.25), -1.1),
    new THREE.Vector3(.2, offset + (index % 2 ? -.18 : .28), -1.45),
    new THREE.Vector3(3.9, offset + (index % 2 ? .24 : -.12), -1.7),
  ]);
  const material = new THREE.MeshBasicMaterial({ color: index % 2 ? 0xb6ede2 : 0xf8d8a1, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false });
  airflowMaterials.push(material);
  atmosphere.add(new THREE.Mesh(new THREE.TubeGeometry(current, 80, .012, 7, false), material));
});

const atmosphericForms = [];
[
  { position: [-3.75, 1.55, -2.6], scale: .48, color: 0xb2ebe1 },
  { position: [-2.85, -1.58, -2.9], scale: .32, color: 0xf6d698 },
  { position: [3.65, 1.15, -3.25], scale: .38, color: 0xaee4d8 },
].forEach((config, index) => {
  const form = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1, 2),
    new THREE.MeshPhysicalMaterial({ color: config.color, roughness: .18, metalness: .05, transparent: true, opacity: .28, clearcoat: .72, iridescence: .22 }),
  );
  form.position.set(...config.position);
  form.scale.setScalar(config.scale);
  form.userData = { phase: index * 1.6, speed: .16 + index * .05, baseline: form.position.y };
  atmosphericForms.push(form);
  atmosphere.add(form);
});

const botanicalField = new THREE.Group();
const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x83cabe, transparent: true, opacity: .28 });
const petalMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd7f4e9, roughness: .32, transparent: true, opacity: .43, clearcoat: .45 });
[-3.7, -3.25, 3.45].forEach((x, index) => {
  const stemPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, -3.1, -2.1),
    new THREE.Vector3(x + (index === 2 ? -.14 : .12), -1.7, -2.2),
    new THREE.Vector3(x + (index === 2 ? .08 : -.2), -.45 + index * .2, -2.3),
  ]);
  botanicalField.add(new THREE.Mesh(new THREE.TubeGeometry(stemPath, 30, .018, 7, false), stemMaterial));
  const blossom = new THREE.Group();
  for (let petal = 0; petal < 5; petal += 1) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), petalMaterial);
    leaf.scale.set(.65, 1.35, .28);
    leaf.position.set(Math.cos((petal / 5) * Math.PI * 2) * .15, Math.sin((petal / 5) * Math.PI * 2) * .15, 0);
    blossom.add(leaf);
  }
  blossom.position.set(stemPath.points[2].x, stemPath.points[2].y, -2.28);
  blossom.userData = { phase: index * 1.3 };
  botanicalField.add(blossom);
});
atmosphere.add(botanicalField);

const haze = new THREE.PointLight(0xffcb7a, 16, 12);
haze.position.set(-2.5, 2.8, 3.2);
scene.add(haze);
scene.add(new THREE.HemisphereLight(0xffe8c1, 0x17484a, 2.2));
const key = new THREE.DirectionalLight(0xfff3db, 3.5); key.position.set(4, 5, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0x6ee2d1, 2.8); rim.position.set(-5, 1, -2); scene.add(rim);

const clock = new THREE.Clock();
let pointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (event) => { pointer.x = (event.clientX / window.innerWidth - .5) * 2; pointer.y = (event.clientY / window.innerHeight - .5) * 2; });
function render() {
  const time = clock.getElapsedTime();
  if (!reduceMotion) {
    group.rotation.y += (pointer.x * .18 - group.rotation.y) * .025;
    group.rotation.x += (-pointer.y * .12 - group.rotation.x) * .025;
    spray.position.y = Math.sin(time * .72) * .11;
    spray.rotation.y = -.4 + Math.sin(time * .33) * .08;
    mist.scale.x = .92 + Math.sin(time * 1.4) * .12;
    mist.rotation.z = Math.sin(time * .64) * .045;
    mistMaterials.forEach((material, index) => { material.opacity = .11 + Math.sin(time * 1.1 + index) * .05; });
    bloom.material.opacity = .24 + Math.sin(time * .56) * .07;
    productLight.intensity = 3.8 + Math.sin(time * .7) * .8;
    pollenGrains.forEach((grain) => {
      grain.position.y = grain.userData.baseline + Math.sin(time * grain.userData.speed + grain.userData.phase) * .14;
      grain.rotation.x = time * grain.userData.speed;
      grain.rotation.y = time * grain.userData.speed * .7;
    });
    atmosphere.rotation.y += (pointer.x * .055 - atmosphere.rotation.y) * .016;
    atmosphere.rotation.z = Math.sin(time * .19) * .018;
    airflowMaterials.forEach((material, index) => { material.opacity = .075 + Math.sin(time * .42 + index) * .028; });
    atmosphericForms.forEach((form) => {
      form.rotation.x = time * form.userData.speed;
      form.rotation.y = time * form.userData.speed * .65;
      form.position.y = form.userData.baseline + Math.sin(time * .55 + form.userData.phase) * .12;
    });
    botanicalField.rotation.z = Math.sin(time * .38) * .025;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

function resize() {
  const phone = window.innerWidth < 640;
  const compact = window.innerWidth < 960;
  // Recompose, rather than merely shrink, the scene at each breakpoint.
  // This keeps the entire device in frame and out of the headline's reading area.
  if (phone) {
    group.position.set(.5, -1.36, -.9);
    group.scale.setScalar(.5);
    spray.rotation.z = -.32;
    atmosphere.position.set(0, -.36, -2.75);
    atmosphere.scale.setScalar(.68);
  } else if (compact) {
    group.position.set(1.65, -.72, -.35);
    group.scale.setScalar(.72);
    spray.rotation.z = -.27;
    atmosphere.position.set(-.18, -.12, -2.75);
    atmosphere.scale.setScalar(.84);
  } else {
    group.position.set(3.15, -.28, 0);
    group.scale.setScalar(1);
    spray.rotation.z = -.22;
    atmosphere.position.set(0, 0, -2.75);
    atmosphere.scale.setScalar(1);
  }
  pollenGrains.forEach((grain, index) => { grain.visible = !phone || index % 2 === 0; });
  renderer.setSize(window.innerWidth, hero.offsetHeight);
  camera.aspect = window.innerWidth / hero.offsetHeight;
  camera.fov = phone ? 42 : 38;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

// Framer Motion carries the editorial rhythm through every content chapter.
const softEase = [0.16, 1, 0.3, 1];
const reveal = (scope, selector, direction = 'y', distance = 30, delay = .1) => {
  const section = document.querySelector(scope);
  if (!section) return;
  const nodes = Array.from(section.querySelectorAll(selector));
  if (!nodes.length) return;
  inView(section, () => animate(
    nodes,
    { opacity: [0, 1], transform: [direction === 'x' ? `translateX(${distance}px)` : `translateY(${distance}px)`, 'translate(0px, 0px)'] },
    { duration: .72, delay: stagger(delay), ease: softEase },
  ), { amount: .2 });
};

if (!reduceMotion) {
  animate('.hero-copy', { opacity: 1, transform: 'translateY(0px)' }, { duration: .78, delay: stagger(.12, { startDelay: .18 }), ease: softEase });
  reveal('#trust-strip', 'p', 'y', 18, .08);
  reveal('#intro', 'p, h2, h3', 'y', 36, .12);
  reveal('#intended-for', 'p, h2, .feature-card', 'y', 34, .1);
  reveal('#fit', 'p, h2, h3, article', 'y', 30, .1);
  reveal('#compare', 'p, h2, .mt-10', 'y', 30, .1);
  reveal('#spray-basics', '.sticky > *, .step-card', 'x', 30, .1);
  reveal('#use-access', 'p, h2, h3, article', 'x', 30, .1);
  reveal('#shipping-support', 'p, h2, h3, h4', 'y', 26, .08);
  reveal('#nasal-epinephrine-features', 'p, h2, h3, h4, .mt-12 > div', 'y', 36, .11);
  reveal('#nasal-epinephrine-allergy-spray', 'p, h2, h3, h4, article', 'y', 28, .09);
  reveal('#next', 'p, a', 'y', 32, .12);
  reveal('footer', 'p', 'y', 16, .08);

  // Small, persistent cues keep the page alive between scroll events.
  animate('.feature-card > span', { transform: ['translateY(0px) rotate(0deg)', 'translateY(-6px) rotate(4deg)'] }, { duration: 2.4, delay: stagger(.18), repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' });
  animate('#format .text-3xl', { transform: ['translateY(0px)', 'translateY(-7px)'] }, { duration: 2.1, delay: stagger(.16), repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' });
  animate('#next .absolute', { transform: ['translateY(0px)', 'translateY(12px)'] }, { duration: 4, delay: stagger(.4), repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' });
}

document.querySelectorAll('.faq').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open && !reduceMotion) animate(item.querySelector('p'), { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0px)'] }, { duration: .3, ease: softEase });
  });
});

// GSAP scrolls the Three.js scene and its atmospheric layers independently from the UI reveals.
gsap.to(group.position, { y: -1.2, z: -1.5, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
gsap.to(group.rotation, { z: .35, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
gsap.to(atmosphere.position, { y: -.72, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 } });
gsap.to(atmosphere.rotation, { z: -.1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
gsap.to('.hero-photo', { scale: 1.12, yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.25 } });
gsap.to('.hero-grid', { yPercent: 13, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
window.addEventListener('scroll', () => { const h = document.documentElement; document.documentElement.style.setProperty('--scroll', `${(h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100}%`); }, { passive: true });
