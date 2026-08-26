/* Thiqti — Hero 3D holographique (Three.js r147 UMD, aucun module requis) */
(function () {
  'use strict';

  function init() {
    var host = document.querySelector('.hero-car');
    if (!host || !window.THREE || !window.WebGLRenderingContext) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = 'car3d-canvas';
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4.2, 1.7, 5.4);

    if (THREE.RoomEnvironment && THREE.PMREMGenerator) {
      try {
        var pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
      } catch (e) {}
    }

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    var dl = new THREE.DirectionalLight(0xa5b4fc, 2.0);
    dl.position.set(5, 6, 5);
    scene.add(dl);
    var rim = new THREE.DirectionalLight(0x6d28d9, 1.2);
    rim.position.set(-6, 3, -4);
    scene.add(rim);

    var glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9db8ff,
      metalness: 0.15,
      roughness: 0.18,
      transmission: 0.9,
      thickness: 1.2,
      ior: 1.4,
      transparent: true,
      opacity: 0.92
    });
    var wireMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    var wheelMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.75,
      roughness: 0.35
    });

    var root = new THREE.Group();
    scene.add(root);

    var car = null;
    var draco = new THREE.DRACOLoader();
    draco.setDecoderPath('vendor/umd/');

    var loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load('models/car.glb',
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
            if (o.isMesh) {
              if (/wheel|tyre|tire|rim/i.test(o.name)) o.material = wheelMat;
              else { o.material = glassMat; overlays.push(o); }
            }
          });
          overlays.forEach(function (o) {
            var wf = new THREE.Mesh(o.geometry, wireMat);
            wf.raycast = function () {};
            o.add(wf);
          });

          root.add(car);
          root.rotation.y = Math.PI * 0.12;
          host.classList.add('car3d-on');
          var svg = host.querySelector('.car-3d-svg');
          var porscheWrap = host.querySelector('.hero-porsche-wrap');
          if (svg) svg.style.display = 'none';
          if (porscheWrap) porscheWrap.style.opacity = '0';
        } catch (err) {
          console.error('[hero3d] init:', err);
        }
      },
      undefined,
      function (err) { console.error('[hero3d] chargement:', err); }
    );

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.set(0, 0.15, 0);
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.58;

    /* Mouse-tracking rotation: modulate auto-rotate speed + small yaw offset */
    var mouseX = 0;
    var mouseTargetX = 0;
    var baseRotationY = Math.PI * 0.12;
    host.addEventListener('mousemove', function(e) {
      var r = host.getBoundingClientRect();
      mouseTargetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    }, { passive: true });
    host.addEventListener('mouseleave', function() {
      mouseTargetX = 0;
    }, { passive: true });

    function resize() {
      var w = host.clientWidth || 1;
      var h = host.clientHeight || 480;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(host);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    var clock = new THREE.Clock();
    var lastFrame = 0;

    function tick(now) {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      var home = document.getElementById('page-home');
      if (home && home.style.display === 'none') return;
      if (now - lastFrame < 33) return;
      lastFrame = now;
      var t = clock.getElapsedTime();
      /* Smooth mouse interpolation */
      mouseX += (mouseTargetX - mouseX) * 0.05;
      controls.autoRotateSpeed = 0.8 + mouseX * 0.6;
      if (car) {
        root.position.y = Math.sin(t * 1.2) * 0.08;
        root.rotation.y = baseRotationY + mouseX * 0.25;
      }
      controls.update();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
