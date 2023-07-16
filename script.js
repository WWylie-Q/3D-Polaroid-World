/*
 * 3D POLAROID WORLD
 * Small virtual gallery for my GLSL #anydayshaders on-going experiments.
 *
 * - Move around the space in all directions by dragging your cursor or dragging with a finger on touch devices.
 * - Zoom in/out with mouse wheel or a two fingers gesture in trackpad and touch devices.
 * - Press the play/stop button to toggle all animations.
 * - Press buttons to change the world's mood: multicolored vs. monochrome black and white <3.
 *

 */

// GLOBAL POLAROID FILM
const nearDist = 1;
const farDist = 1400;
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	nearDist,
	farDist
);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const canvasWrapper = document.querySelector("#canvas-wrapper");
const clock = new THREE.Clock();
const tau = 2*Math.PI;
let controls;

const init = () => {
	camera.position.set(0, 0, 150);

	renderer.setClearColor("hotpink");
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	canvasWrapper.appendChild(renderer.domElement);
};
init();

const updateObjMatrix = (object) => {
	object.updateMatrix();
	object.matrixAutoUpdate = false;
};

// INSTANT FILM
const iWidth = 170;
const iHeight = iWidth * 1.2;
const iDepth = iWidth / 5;
const filmGeometry = new THREE.BoxBufferGeometry(
	iWidth,
	iHeight,
	iDepth
);
const emissiveLight = "#f9e6de"; // creamy
const materialOptions = {
	emissive: emissiveLight,
	shininess: 80
};
const filmMaterial = new THREE.MeshPhongMaterial(materialOptions);

// Add light for MeshPhongMaterial to be visible in scene
const spotLight = new THREE.SpotLight('#fffffd', 0.3);
spotLight.position.set(100, 400, 100);
scene.add(spotLight);

// INSTANT FILM PRINTS
const pWidth = iWidth/1.2;
const printGeometry = new THREE.PlaneBufferGeometry(
	pWidth,
	pWidth,
	1
);
const printMaterial = new THREE.MeshBasicMaterial({ color: "#000" });

const Film = function (group) {
	this.group = group;
};

let printMesh;
Film.prototype.create = function () {
	const iFilm = new THREE.Mesh(filmGeometry, filmMaterial);
	printMesh = new THREE.Mesh(printGeometry, printMaterial);

	printMesh.position.y = pWidth/10;
	printMesh.position.z = iDepth - 15;

	updateObjMatrix(printMesh);
	
	this.group.add(iFilm);
	this.group.add(printMesh);
};

const addPrintMeshMaterial = (gp, newMat) => gp.children[1].material = newMat;

const vertexShader = document.querySelector("#vertex").textContent;
const fragPixelShader = document.querySelector("#frag-pixel").textContent;
const fragLinesShader = document.querySelector("#frag-lines").textContent;
const fragHalftoneShader = document.querySelector("#frag-halftone").textContent;
const fragMixshapedShader = document.querySelector("#frag-mixshaped").textContent;

const instantGroup = new THREE.Group();

const uniformMulti = { type: "v2", value: new THREE.Vector2(0.52, 0.75) };
const uniformMono = { type: "v2", value: new THREE.Vector2(1.0, 1.0) };
const uniforms = {
	u_gb: uniformMulti,
	u_resolution: { type: "v2", value: new THREE.Vector2(1.0, 1.0) },
	u_time: { type: "f", value: 1.0 },
};
const setShaderMaterial = (fragShader) => new THREE.ShaderMaterial({
	uniforms,
	fragmentShader: fragShader,
	vertexShader,
});

const pixelPolaroid = setShaderMaterial(fragPixelShader);
const linesPolaroid = setShaderMaterial(fragLinesShader);
const halftonePolaroid = setShaderMaterial(fragHalftoneShader);
const mixshapedPolaroid = setShaderMaterial(fragMixshapedShader);

const filmGroup_01 = new THREE.Group();
const film_01 = new Film(filmGroup_01);
film_01.create();
addPrintMeshMaterial(filmGroup_01, pixelPolaroid);
instantGroup.add(filmGroup_01);

const filmGroup_02 = new THREE.Group();
const film_02 = new Film(filmGroup_02);
filmGroup_02.position.z = iWidth*1.5;
filmGroup_02.position.x = iWidth*1.5;
filmGroup_02.rotation.y = tau/-4;
updateObjMatrix(filmGroup_02);
film_02.create();
addPrintMeshMaterial(filmGroup_02, linesPolaroid);
instantGroup.add(filmGroup_02);

const filmGroup_03 = new THREE.Group();
const film_03 = new Film(filmGroup_03);
filmGroup_03.position.z = iWidth*1.5;
filmGroup_03.position.x = iWidth*-1.5;
filmGroup_03.rotation.y = tau/4;
updateObjMatrix(filmGroup_03);
film_03.create();
addPrintMeshMaterial(filmGroup_03, halftonePolaroid);
instantGroup.add(filmGroup_03);

const filmGroup_04 = new THREE.Group();
const film_04 = new Film(filmGroup_04);
filmGroup_04.position.z = iWidth*3;
filmGroup_04.rotation.y = tau/2;
updateObjMatrix(filmGroup_04);
film_04.create();
addPrintMeshMaterial(filmGroup_04, mixshapedPolaroid);
instantGroup.add(filmGroup_04);

instantGroup.position.z = iWidth*-1.5;
scene.add(instantGroup);

// 3D CONFETTI
const confettiGroup = new THREE.Group();
const radius = 3.5;
const triangleGeom = new THREE.TetrahedronBufferGeometry(radius);
const triangleMat = new THREE.MeshNormalMaterial();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const randomizeMatrix = (matrix) => {
	const position = new THREE.Vector3();
	const rotation = new THREE.Euler();
	const quaternion = new THREE.Quaternion();
	const scale = new THREE.Vector3();	

	const d = nearDist * 340;
	const d2 = d * 2;

	position.x = Math.random() * d2 - d;
	position.y = Math.random() * d2 - d;
	position.z = Math.random() * d2 - d;

	rotation.x = Math.random() * tau;
	rotation.y = Math.random() * tau;
	rotation.z = Math.random() * tau;

	quaternion.setFromEuler(rotation);

	scale.x = scale.y = scale.z = getRandomArbitrary(0.7, 1);

	matrix.compose(position, quaternion, scale);
};

const matrix = new THREE.Matrix4();
const count = Math.round(Math.max(window.innerWidth, window.innerHeight) / 8);
const deco = new THREE.InstancedMesh(triangleGeom, triangleMat, count);

for (let i = 0; i < count; i++) {
	randomizeMatrix(matrix);
	deco.setMatrixAt(i, matrix);
}

confettiGroup.add(deco);
scene.add(confettiGroup);

// WORLD COLOR & ANIMATION TOGGLE
let IS_ANIMATED = true;
const toggle = {
	btnAnim: document.querySelector("#toggle-anim button"),
	btnColor: document.querySelectorAll("#toggle-color button"),
	updateMaterial(mode) {
		const toggleMaterial =
			mode === "monochrome" ? uniformMono : uniformMulti;

		printMesh.material.uniforms.u_gb = toggleMaterial;
		printMesh.material.uniformsNeedUpdate = true;
	},
	checkActiveBtnColor() {
		this.btnColor.forEach((el) => {
			el.addEventListener("click", (e) => {
				e.preventDefault();

				const target = e.currentTarget;

				this.btnColor.forEach((l) => delete l.dataset.active);
				target.dataset.active = true;

				this.updateMaterial(target.dataset.mode);
			});
		});
	},
	checkActiveBtnAnim() {
		this.btnAnim.addEventListener("click", (e) => {
			e.preventDefault();

			const target = e.currentTarget;
			const txtPlay = `play`;
			const txtPause = `pause`;
			const iconPlay = `►`;
			const iconPause = `||`;
			
			function setBtnData(btn, icon) {
				target.dataset.action = btn;
				target.title = btn;
				target.textContent = icon;
			}
		
			if (target.dataset.action === 'pause') {
				setBtnData(txtPlay, iconPlay);
				IS_ANIMATED = false;
			} else {
				setBtnData(txtPause, iconPause);
				IS_ANIMATED = true;
			}
		});
	}
};
toggle.checkActiveBtnColor();
toggle.checkActiveBtnAnim();

// SCREEN RESIZE
const onWindowResize = () => {
	const w = window.innerWidth;
	const h = window.innerHeight;
	
	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize(w, h);
	
	uniforms.u_resolution.value.x = renderer.domElement.width;
	uniforms.u_resolution.value.y = renderer.domElement.height;
};
window.addEventListener("resize", onWindowResize);

// CONSTROLS INTERACTION
const createControls = () => {
	// Make sure to run controls outside render function 
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	// If controls autoRotate is true, update controls during render
	controls.autoRotateSpeed = 3.0;
	controls.enableDamping = true;
	controls.dampingFactor = 0.15;
	controls.enableZoom = true;
	controls.minDistance = 0;
	controls.maxDistance = 750;
	controls.keyPanSpeed = 30;
};
createControls();

// CREATE ANIMATIONS
const createAnimShaders = () => {
	if (IS_ANIMATED) {
		uniforms.u_time.value = clock.getElapsedTime();
	}
};

const pos = 550;
confettiGroup.position.y = pos;

const createAnimConfetti = () => {	
	if (IS_ANIMATED) {
		const time = 0.5;
		let speed = time + Math.random() * time;
		confettiGroup.position.y -= speed;

		if (confettiGroup.position.y < -pos) {
			confettiGroup.rotation.x = tau;
			confettiGroup.position.y = pos;
			speed = 0;
		}
	}
};

// RENDER 3D WORLD
const render = () => {	
	createAnimShaders();
	createAnimConfetti();

	controls.autoRotate = IS_ANIMATED ? true : false;
	controls.update();
	
	renderer.render(scene, camera);

	requestAnimationFrame(render);
};
render();