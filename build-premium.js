/* Build thiqti-premium.html : page 100% autonome (libs UMD + GLB + Draco en base64).
   Usage: node build-premium.js   → régénère thiqti-premium.html depuis la source. */
const fs = require('fs');
const path = require('path');

const SRC = 'thiqti-premium-src.html';
const OUT = 'thiqti-premium.html';
const MARKER = '<!-- @PREMIUM_3D_TAIL -->';

const b64 = (p) => fs.readFileSync(p).toString('base64');

function main() {
  let html = fs.readFileSync(SRC, 'utf8');

  const idx = html.indexOf(MARKER);
  if (idx === -1) throw new Error('Marqueur ' + MARKER + ' introuvable dans ' + SRC);
  html = html.slice(0, idx);

  const glbB64 = b64(path.join('models', 'voiture.glb'));
  const wrapB64 = b64(path.join('vendor', 'umd', 'draco_wasm_wrapper.js'));
  const wasmB64 = b64(path.join('vendor', 'umd', 'draco_decoder.wasm'));

  const lib = (p) => '<script>\n' + fs.readFileSync(p, 'utf8') + '\n</script>';

  const tail = `
${MARKER}
<!-- ══════════════════════════════════════════════════════════════════
     MOTEUR 3D EMBARQUÉ — Three.js r147 UMD + décodeur Draco + modèle GLB
     Tout est dans ce fichier : aucun réseau, aucune dépendance externe.
     Fonctionne en double-clic (file://), localhost et Vercel.
     ══════════════════════════════════════════════════════════════════ -->
${lib(path.join('vendor', 'umd', 'three.min.js'))}
${lib(path.join('vendor', 'umd', 'GLTFLoader.js'))}
${lib(path.join('vendor', 'umd', 'DRACOLoader.js'))}
${lib(path.join('vendor', 'umd', 'OrbitControls.js'))}
${lib(path.join('vendor', 'umd', 'RoomEnvironment.js'))}
<script>
/* Assets base64 : modèle Ferrari (Draco-compressé) + runtime de décompression */
window.THQ_GLB_B64    = "${glbB64}";
window.THQ_DRACO_WRAP = "${wrapB64}";
window.THQ_DRACO_WASM = "${wasmB64}";
</script>
<script>
(function () {
  'use strict';

  function b64ToBuf(b64) {
    var bin = atob(b64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function boot() {
    var host = document.getElementById('canvas-container');
    if (!host || !window.THREE || !window.WebGLRenderingContext) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4.2, 1.7, 5.4);

    try {
      var pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    } catch (e) {}

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    var keyLight = new THREE.DirectionalLight(0xa5b4fc, 2.0);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0x6d28d9, 1.2);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    /* Effet holographique : verre physique + surcouche wireframe lumineuse */
    var glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9db8ff, metalness: 0.15, roughness: 0.18,
      transmission: 0.9, thickness: 1.2, ior: 1.4,
      transparent: true, opacity: 0.92
    });
    var wireMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5, wireframe: true, transparent: true, opacity: 0.18
    });
    var wheelMat = new THREE.MeshStandardMaterial({
      color: 0x111827, metalness: 0.75, roughness: 0.35
    });

    var root = new THREE.Group();
    scene.add(root);

    /* Décodeur Draco servi depuis la mémoire : aucun fetch requis */
    var draco = new THREE.DRACOLoader();
    draco.setDecoderPath('');
    draco._loadLibrary = function (url, responseType) {
      var name = url.split('/').pop();
      var buf = b64ToBuf(name === 'draco_wasm_wrapper.js' ? window.THQ_DRACO_WRAP : window.THQ_DRACO_WASM);
      return Promise.resolve(responseType === 'arraybuffer' ? buf : new TextDecoder().decode(buf));
    };

    var loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(draco);

    var car = null;

    try {
      loader.parse(b64ToBuf(window.THQ_GLB_B64), '',
        function (gltf) {
          try {
            car = gltf.scene;
            var box = new THREE.Box3().setFromObject(car);
            var size = box.getSize(new THREE.Vector3());
            car.scale.setScalar(3.4 / Math.max(size.x, size.y, size.z));
            box.setFromObject(car);
            car.position.sub(box.getCenter(new THREE.Vector3()));

            var overlays = [];
            car.traverse(function (o) {
              if (!o.isMesh) return;
              if (/wheel|tyre|tire|rim/i.test(o.name)) o.material = wheelMat;
              else { o.material = glassMat; overlays.push(o); }
            });
            overlays.forEach(function (o) {
              var wf = new THREE.Mesh(o.geometry, wireMat);
              wf.raycast = function () {};
              o.add(wf);
            });

            root.add(car);
            root.rotation.y = Math.PI * 0.12;

            /* Le placeholder s'efface, le showroom prend le relais */
            var st = document.getElementById('loaderStage');
            if (st) st.classList.add('hidden');
          } catch (err) {
            console.error('[thiqti3d] init:', err);
          }
        },
        function (err) { console.error('[thiqti3d] chargement:', err); }
      );
    } catch (err) {
      console.error('[thiqti3d] parse:', err);
    }

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.set(0, 0.15, 0);
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.58;

    var resize = function () {
      var w = host.clientWidth || 1;
      var h = host.clientHeight || 480;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);
    resize();

    var clock = new THREE.Clock();
    var lastFrame = 0;

    var tick = function (now) {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      if (now - lastFrame < 33) return;
      lastFrame = now;
      var t = clock.getElapsedTime();
      if (car) root.position.y = Math.sin(t * 1.2) * 0.08;
      controls.update();
      renderer.render(scene, camera);
    };
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
</script>

</body>
</html>
`;

  fs.writeFileSync(OUT, html + tail, 'utf8');
  const kb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
  console.log('OK ' + OUT + ' généré (' + kb + ' MB, autonome)');
}

main();
