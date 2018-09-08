var currentTime = Date.now()
var duration = 10000;
var images_path = 'images/'
var system = null;

class SystemElement{

  constructor(scale, texture_filename, normal_filename) {
    this.group = new THREE.Object3D;
    this.texture = new THREE.TextureLoader().load(images_path+texture_filename);
    this.normal = null;
    if(normal_filename){
      this.normal = new THREE.TextureLoader().load(images_path+normal_filename);
    }
    this.material = new THREE.MeshPhongMaterial({ map: this.texture, normalMap: this.normal});
    this.element = new THREE.Mesh(this.constructor.geometry, this.material);
    this.element.visible = true;
    this.scale = scale;
    this.element.scale.set(scale, scale ,scale);
    this.group.add(this.element);
    this.constructor.all.push(this);

    this.orbital_group = new THREE.Object3D;
    this.orbital_group.add(this.group)
  }
  add_orbital_element(element, radius, show_path = true) {
    if (show_path){
      var path_geometry = new THREE.TorusGeometry(radius, .05, 8, 360 );
      var path = new THREE.Mesh( path_geometry, this.constructor.path_material );
      path.rotation.x += Math.PI /2
      this.group.add(path)

    }

    element.group.position.set(radius, 0,0);
    this.group.add(element.orbital_group);
    
    // element.element.position.set(radius, 0,0);
    // this.group.add(element.group)
  }
  add_multiple_orbital_elements(elements){
    for (var i = 0; i < elements.length; i++) {
      this.add_orbital_element(elements[i],(this.scale*3) * (i+1) +elements[i].scale);
    }
  }
}
// Set geometry as class variable
SystemElement.geometry = new THREE.SphereGeometry(2, 20, 20);
SystemElement.path_material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
SystemElement.all = [];

class SolarSystem {
  constructor(sun) {
    this.sun = sun;
    this.planets = [];
    this.groups = [];
  }
  add_planet(planet, radius){
    var group = new THREE.Object3D;
    planet.group.position.set(radius, 0,0);
    group.add(planet.group)


    // var path_geometry = new THREE.TorusGeometry(radius, .05, 8, 360 );
    // var path = new THREE.Mesh( path_geometry, this.constructor.path_material );
    // // 90 degree rotation
    // path.rotation.x += Math.PI /2
    // group.add(path)
    this.groups.push(group);

  }
  add_planets(planets){
    for (var i = 0; i < planets.length; i++) {
      // console.log(this.scale);
      // console.log((planets[i].scale*3) * (i+1) +planets[i].scale);
      this.add_planet(planets[i], (i+1)*35);

    }
    console.log(this.groups);
  }
}
SolarSystem.path_material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );


function animate() {
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
    var movement = now * 0.001;

    // for (var i = 0; i < system.groups.length; i++) {
    //   system.groups[i].rotation.y += angle/i;
    // }

    for (var i = 0; i < SystemElement.all.length; i++) {
      // Rotation over orbiting element
      // Farther away the slower they go
      SystemElement.all[i].group.rotation.y += angle/(i+1);
      // Rotation over their own axis
      // The bigger they are the slower they rotate
      // SystemElement.all[i].element.rotation.y += angle/SystemElement.all[i].scale;

      SystemElement.all[i].orbital_group.rotation.y += angle/(i+1);

    }

}

function run() {
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
    // Spin the cube for next frame
    animate();
}

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);
  // Create a new Three.js scene
  scene = new THREE.Scene();
  // Set the background color
  scene.background = new THREE.Color( 0,0,0);
  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
  camera.position.z = 500;
  // camera.position.x = 200;
  scene.add(camera);

  // Create a group to hold all the objects
  solar_system = new THREE.Object3D;
  light = new THREE.AmbientLight ( 0xffffff );
  solar_system.add(light);


  // emissive sun
  // orbit controls
  sun = new SystemElement(15, 'sunmap.jpg', null);
  mercury = new SystemElement(0.9, 'mercurymap.jpg', null);
  venus = new SystemElement(1.7, 'venusmap.jpg', null);
  earth = new SystemElement(1.8, 'earth_atmos_2048.jpg', 'earth_normal_2048.jpg');
  moon = new SystemElement(.3, 'moon_texture.jpg', null);
  mars = new SystemElement(1.3, 'mars_1k_color.jpg', null);
  jupiter = new SystemElement(6, 'jupitermap.jpg', null);
  saturno = new SystemElement(5, 'saturnmap.jpg', null);
  urano = new SystemElement(4.7, 'uranusmap.jpg', null);
  neptune = new SystemElement(4.5, 'neptunemap.jpg', null);
  pluto = new SystemElement(0.8, 'plutomap1k.jpg', null);



  // earth.add_orbital_element(moon, 0, false);
  sun.add_multiple_orbital_elements([mercury,venus,earth,mars,jupiter,saturno,urano,neptune,pluto])
  // system = new SolarSystem(sun);
  // system.add_planets([mercury,venus,earth,mars,jupiter,saturno,urano,neptune,pluto]);

  earth.add_multiple_orbital_elements([moon])

  // scene.add(earth.group);

  // system.groups.forEach(function(group){
  //   scene.add(group);
  // })

  scene.add(sun.group);
  scene.add(solar_system);



}
