var currentTime = Date.now()
var duration = 10000;
var images_path = 'images/'
var system = null;
var sun_scene_lights = [];
var sun_intensity = 1;


class SystemElement{

  constructor(scale, texture_filename, normal_filename, bump = false, map_scale = .2) {
    this.group = new THREE.Object3D;
    this.scale = scale;
    if(texture_filename){
      this.texture = new THREE.TextureLoader().load(images_path+texture_filename);
      this.normal = null;
      if(normal_filename){
        this.normal = new THREE.TextureLoader().load(images_path+normal_filename);
      }
      if(bump){
        this.material = new THREE.MeshPhongMaterial({ map: this.texture, bumpMap: this.normal});
        this.material.bumpScale = map_scale;
      }
      else{
        this.material = new THREE.MeshPhongMaterial({ map: this.texture, normalMap: this.normal});
        this.material.normalScale.set( map_scale,map_scale);

      }


      this.element = new THREE.Mesh(this.constructor.geometry, this.material);
      this.element.visible = true;
      this.element.scale.set(scale, scale ,scale);
      this.group.add(this.element);


    }
    this.constructor.all.push(this);
    this.orbital_group = new THREE.Object3D;
    this.orbital_group.add(this.group)


  }
  add_orbital_element(element, radius, show_path = true) {
    if (show_path){
      var path_geometry = new THREE.TorusGeometry(radius, .1, 8, 360 );
      var path = new THREE.Mesh( path_geometry, this.constructor.path_material );
      path.rotation.x += Math.PI /2
      this.group.add(path)
    }

    element.group.position.set(radius, 0,0);
    this.group.add(element.orbital_group);

  }
  add_multiple_orbital_elements(elements){
    for (var i = 0; i < elements.length; i++) {
      this.add_orbital_element(elements[i],(this.scale*3) * (i+1) +elements[i].scale);
    }
  }
}
// Set geometry as class variable
SystemElement.geometry = new THREE.SphereGeometry(2, 20, 20);
SystemElement.path_material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
SystemElement.all = [];


function animate() {
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    for (var i = 0; i < SystemElement.all.length; i++) {
      // Rotation over orbiting element
      // Farther away the slower they go
      SystemElement.all[i].group.rotation.y += angle/SystemElement.all[i].scale;
      // SystemElement.all[i].group.rotation.y += angle*SystemElement.all[i].scale/2;

      // Rotation over their own axis
      // The bigger they are the slower they rotate
      SystemElement.all[i].orbital_group.rotation.y += angle/(i+1);

    }


    for (var i = 0; i < sun_scene_lights.length; i++) {
      sun_scene_lights[i].intensity += sun_intensity*100/duration
    }

    // Last element
    if(sun_scene_lights[3].intensity > 8 || sun_scene_lights[3].intensity < 5){
      sun_intensity = sun_intensity*-1;

    }

}

// For the sun to have its own colors
function createSunScene() {
  sun_scene = new THREE.Scene();
  sun = new SystemElement(20, 'lava2.jpg', 'lavaNormal.png', false ,1);

  // Add a directional light to show off the object
  var top_light = new THREE.DirectionalLight( 0xffffff, 8);
  var bottom_light = new THREE.DirectionalLight( 0xffffff, 8);
  var front_light = new THREE.DirectionalLight( 0xffffff, 8);
  var back_light = new THREE.DirectionalLight( 0xffffff, 8);

  front_light.position.set(100, 0, 0);
  back_light.position.set(-100, 0, 0);
  top_light.position.set(0, 100, 0);
  bottom_light.position.set(0, -100, 0);

  bottom_light.target = sun.element;
  top_light.target = sun.element;
  front_light.target = sun.element;
  back_light.target = sun.element;

  sun_scene.add(bottom_light);
  sun_scene.add(top_light);
  sun_scene.add(front_light);
  sun_scene.add(back_light);

  sun_scene_lights = [top_light,bottom_light,front_light,back_light];

  sun_scene.add(sun.group);

  return sun_scene;
}

function add_ambient_light(intensity = 1) {
  // Ambient lighting
  // Red
  var light = new THREE.AmbientLight( 0xff0000);
  light.intensity = .01*intensity
  scene.add( light );
  // Orange
  var light = new THREE.AmbientLight( 0xffb200);
  light.intensity = .1*intensity
  scene.add( light );
  // White-Yellow
  var light = new THREE.AmbientLight( 0xfeffe2);
  light.intensity = .4*intensity
  scene.add( light );
}

function get_star_field() {
  // Star starField taken from documentation
  var starsGeometry = new THREE.Geometry();
  for ( var i = 0; i < 40000; i ++ ) {
     var star = new THREE.Vector3();
     // Taken from https://gist.github.com/KhanMaytok/d76f58c55704b7ce6140
     var theta = THREE.Math.randFloatSpread(360);
     var phi = THREE.Math.randFloatSpread(360);
     star.x = 500 * Math.sin(theta) * Math.cos(phi);
     star.y = 500 * Math.sin(theta) * Math.sin(phi);
     star.z = 500 * Math.cos(theta);
     starsGeometry.vertices.push( star );


  }
  var starsMaterial = new THREE.MeshPhongMaterial({ color: 0xfeffe2,emissive: 0xffffff, emissiveIntensity:.6});
  // var starsMaterial = new THREE.PointsMaterial( { color: 0x888888, size:10 } );
  var starField = new THREE.Points( starsGeometry, starsMaterial );
  return starField;

}

function run() {
    requestAnimationFrame(function() { run(); });
    renderer.clear();
    // renderer.render( backgroundScene, backgroundCamera );
    renderer.render( scene, camera );
    renderer.render( sun_scene, camera );
    // Spin the cube for next frame
    animate();
}

function load_asteroids(sun_placer) {
  // instantiate a loader
  var loader = new THREE.OBJLoader();

  // load a resource
  loader.load('images/asteroid.obj',function (object) {
      asteroids = new THREE.Object3D;
      texture = new THREE.TextureLoader().load("images/astroid_texture.jpg");
      material = new THREE.MeshPhongMaterial({ map: texture});
      geometry = object.children[0].geometry
      element = new THREE.Mesh(geometry, material);
      for ( var i = 0; i < 1500; i ++ ) {
        var asteroid = element.clone()
        var theta = THREE.Math.randFloatSpread(360);
        var phi = THREE.Math.randFloatSpread(360);

        var r = 225
        sizex = Math.abs(THREE.Math.randFloatSpread(.1))

        asteroid.scale.set(sizex,sizex,sizex);
        asteroid.position.x = (r + 10*Math.cos(theta))*Math.cos(phi)
        asteroid.position.y = (r + 10*Math.cos(theta*THREE.Math.randFloatSpread(1000)))*Math.sin(phi)
        asteroid.position.z = 10*Math.sin(theta*20/i);
        asteroids.add( asteroid );

      }
      asteroids.rotation.x += Math.PI /2
      sun_placer.group.add(asteroids)
    });
}

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);
  renderer.autoClear = false;

  // Create a new Three.js scene
  scene = new THREE.Scene();
  // Set the background color
  scene.background = new THREE.Color( 0,0,0);
  // scene.background =new THREE.TextureLoader().load('images/background3.png' );
  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
  camera.position.z = 100;
  // camera.position.x = 200;


  scene.add(camera);

  var controls = new THREE.OrbitControls( camera );
  controls.update();



  var sun_scene = createSunScene();

  // Set Sun Light
  var sunlight = new THREE.PointLight( 0xfeffe2, 2, 100000 );
  sunlight.distance= 600
  scene.add( sunlight );

  add_ambient_light(.2)

  scale_all = 1.5
  sun_placer = new SystemElement(17);
  mercury = new SystemElement(scale_all*0.9, 'mercurymap.jpg', 'mercurybump.jpg',true);
  venus = new SystemElement(scale_all*1.7, 'venusmap.jpg', 'venusbump.jpg',true);
  earth = new SystemElement(scale_all*1.8, 'earth_atmos_2048.jpg', 'earth_normal_2048.jpg');
  moon = new SystemElement(scale_all*.3, 'moon_texture.jpg', 'moon_bump.jpg',true);
  mars = new SystemElement(scale_all*1.3, 'mars_1k_color.jpg', 'mars_1k_normal.jpg');
  jupiter = new SystemElement(scale_all*6, 'jupitermap.jpg', null);
  saturno = new SystemElement(scale_all*5, 'saturnmap.jpg', null);
  urano = new SystemElement(scale_all*4.7, 'uranusmap.jpg', null);
  neptune = new SystemElement(scale_all*4.5, 'neptunemap.jpg', null);
  pluto = new SystemElement(scale_all*0.8, 'plutomap1k.jpg', 'plutobump1k.jpg');


  sun_placer.add_multiple_orbital_elements([mercury,venus,earth,mars,jupiter,saturno,urano,neptune,pluto])

  earth.add_multiple_orbital_elements([moon])

  load_asteroids(sun_placer)
  var starField = get_star_field();


  scene.add(starField);
  scene.add(sun_placer.group);
  // scene.add(earth.group)
  // SUN GLOW
  var customMaterial = new THREE.ShaderMaterial(
  {
    side: THREE.BackSide,
    fragmentShader:"void main() {gl_FragColor = vec4( 1.0, 1.0, 0.9, 1.0 );}",
    transparent: true
  });
  console.log(customMaterial);
  var sunGlow = new THREE.Mesh( SystemElement.geometry.clone(), customMaterial.clone() );
  sunGlow.scale.multiplyScalar(20.5);
	scene.add( sunGlow );

}
