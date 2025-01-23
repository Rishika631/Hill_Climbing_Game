// variables and constants
const c = document.getElementById('canvas');
c.width = window.innerWidth;
c.height =  window.innerHeight; 
const ctx = c.getContext('2d');
const p = document.getElementById('p');
const modalBox = document.getElementsByClassName('modal')[0];
const leftBox = document.getElementsByClassName('left')[0];
const rightBox = document.getElementsByClassName('right')[0];

window.addEventListener('resize',()=>c.width = window.innerWidth);

if(typeof(localStorage.coins) == "undefined" || localStorage.coins == "NaN"){
	localStorage.setItem('coins',0);
}

if(typeof(localStorage.feuls) == "undefined" || localStorage.feuls == "NaN"){
	localStorage.setItem('feuls',10);
}

// High score initialization
if (typeof localStorage.highScore === "undefined" || localStorage.highScore === "NaN") {
    localStorage.setItem("highScore", 0);
}

//left, right, top, bottom of keybords
let keys = [37,39,38,40];


// physics of car
let acc = 0;
let speed = 0;
let position = 0;

// functions related to physics of ground.

let layer = [];
while(layer.length < 255){
	while(layer.includes(val = Math.floor(Math.random()*255)));
	layer.push(val);
}

let lerp = (a,b,t) => a+(b-a)*(1-Math.cos(t*Math.PI))/2;

const noise =(x)=>{
	x = x*0.005%255;
	return lerp(layer[Math.floor(x)],layer[Math.ceil(x)],x-Math.floor(x)) * 1.5 - 110;
}

class modals {
	// constructor(){

	// }
	open(){
		modalBox.style.display='grid';
	}
	close(){
		modalBox.style.display='none';
	}
	gameloss(){
		modalBox.children[0].innerHTML = "Sorry You Lose <br> You have "+localStorage.coins+ " coins";
	}
}

const modal = new modals();

// Function to update high score
const updateHighScore = () => {
    const currentCoins = parseInt(localStorage.coins);
    const highScore = parseInt(localStorage.highScore);
    if (currentCoins > highScore) {
        localStorage.highScore = currentCoins;
    }
};

class thisGame{
	constructor(){
		this.state = 0;		
	}
	reset(){
		updateHighScore();
		position=0;
		speed=0;
		acc=0;
		player.rot=0;
		coins.allCoins = [];
		feuls.allfeuls = [];
		objects.allObjects = [];
		player.rSpeed = 0;
		bg.coinCount=0;
		player.ySpeed = 0;
		localStorage.coins = 0;
        localStorage.feuls = 10;
	}
	start(){
		this.state = 1;
		this.reset();
		modal.close();
		loop();
	}
}
const game = new thisGame();

class Wheel {
    constructor(x, y, radius, imageSrc) {
        this.position = { x: x, y: y };
        this.radius = radius;
        this.rotation = 0;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    rotate(speed) {
        // Wheels rotate based on speed. The faster the speed, the faster they rotate.
        this.rotation += (speed * 0.1) % 360;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180); // Convert rotation to radians
        ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        ctx.restore();
    }
}

// Background

class background{
	constructor(){
		this.image = new Image;
		this.image.src = 'img/tile.png';
		this.skyImage = new Image;
        this.skyImage.src = 'img/background.png';
		this.time = { // Timimg
			lastTime: 0,
			start: (currentTime)=>{
				this.deltaTime = currentTime - this.lastTime;
				position += speed,speed += acc;
			},
			end: (currentTime)=>{
				this.lastTime = currentTime;
			}
		};
		this.dashboard = { // Dashboard
			text: (color,text,x,y)=>{
			 	ctx.font="40px dashboard";
			 	ctx.fillStyle = color;
			 	ctx.fillText(text,x,y);
			},
			show: ()=>{
				this.dashboard.text('#ff4d4d',Math.round(position)+ ' m',50,50); // Distance
				this.dashboard.text('#ff4d4d',Math.round(Math.abs(speed))+' km/h',c.width-300,50); // Speed
				this.coinImg = new Image();
				this.coinImg.src = 'img/coin.png';
				ctx.drawImage(this.coinImg,50,70,30,30);
				this.dashboard.text('#fde318',localStorage.coins,100,100);
				this.dashboard.text('#ff6347', "Fuel: " + Math.round(localStorage.feuls), c.width-300, 100); // Fuel
				this.dashboard.text("#4caf50", "High Score: " + localStorage.highScore, c.width / 2 - 100, 50); // High Score
			},
			saveCoins: () => {
				localStorage.coins = ((parseInt(localStorage.coins)) + 1); // Increment coins
			},
			saveFuel: () => {
				localStorage.feuls = ((parseInt(localStorage.feuls)) + 5); // Increment fuel
			}
		};
		this.sky = { // Sky
			draw: () => {
				// Clear the previous sky to prevent overlapping
				ctx.clearRect(0, 0, c.width, c.height);
		
				// Draw the sky image
				ctx.drawImage(this.skyImage, 0, 0, c.width, c.height); // Covers the top half of the canvas
			}
		};

		this.tile = {//Ground 
			draw: ()=>{
				ctx.drawImage(this.image,0,0,0,c.height,0,0,0,c.height); 
					for(let i = 0;i < c.width;i++) ctx.drawImage(this.image,i,(0.9*c.height-noise(i+position)*0.5));		
			}}
	}
}

const bg = new background();

// Car related physics
class play{
	constructor(){
		this.ySpeed = 0;
		this.position = {x:c.width/4, y: 0}
		this.width = 100;
		this.height = 50;
		this.rot = 0;
		this.image = new Image;
		this.image.src = 'img/Cars/body.png';
		this.head = new Image();
        this.head.src = 'img/Cars/head.png';
		this.rSpeed = 0;
		 // Define the wheels and their positions
		 const wheelRadius = 40;
		 this.frontWheel = new Wheel(this.position.x, this.position.y-30, wheelRadius, 'img/Cars/wheel1.png');
		 this.rearWheel = new Wheel(this.position.x, this.position.y + 25, wheelRadius, 'img/Cars/wheel2.png');
	}
	draw(){
		this.p1 = (0.9*c.height-noise(position+this.position.x)*0.6);
		this.p2 = (0.9*c.height-noise(position+5+this.position.x)*0.6);
		this.grounded = 0;
		const makeGrounded = () =>{
			this.ySpeed -= this.position.y -(this.p1-15); // bounce of car
			this.position.y = this.p1-15; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 0.3 : makeGrounded();

		this.angle = Math.atan2(this.p2-this.position.y-15,5);
		this.position.y += this.ySpeed;
		
		if(this.grounded){
			if (Math.abs(this.rot)<=Math.PI/2){
				this.rot -= (this.rot-this.angle)/2;
				this.rSpeed -= this.angle - this.rot;
			}else if (Math.abs(this.rot)<=Math.PI){
				this.rot= Math.PI;
				this.rSpeed = 0;
				speed=5;
				game.state=0;
				modal.open();
				modal.gameloss();
			}else{
				this.rot -= (this.rot-this.angle)/2;
				this.rSpeed -= this.angle - this.rot;
			}
		}
		let headTilt = Math.sign(speed) * Math.min(Math.abs(speed) / 8, Math.PI / 8); // Speed-based tilt
		this.rot -= this.rSpeed/20;
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.rotate(this.rot);
		ctx.drawImage(this.image,-15,-100,2*this.width,2*this.height);


		this.frontWheel.position.x = 140;
		this.frontWheel.position.y = 0;
		
		this.rearWheel.position.x = 5;
		this.rearWheel.position.y = 0;

		
		// Draw the wheels with their updated positions
		this.frontWheel.rotate(20*speed);
		this.frontWheel.draw(ctx);
		
		this.rearWheel.rotate(20*speed);
		this.rearWheel.draw(ctx);
    ctx.save();
    ctx.translate(this.width / 2, -120); // Move pivot point to the car's head
    ctx.rotate(headTilt); // Rotate for head tilt
    ctx.drawImage(this.head, -this.width/3, -15, this.width, 40); // Draw head image
    ctx.restore();

    ctx.restore();
		if (localStorage.feuls > 0) {
			localStorage.feuls -= speed * 0.008;  // Fuel consumption based on speed
		} else {
			localStorage.feuls = 0;  // Fuel shouldn't go negative
		}
	}
}
let player = new play();

// coins 

class coin {
	constructor(xPos) {
		this.ySpeed = 0;
		this.position = {x:xPos,y:0};
		this.width = 50,this.height = 50;
		this.image = new Image;
		this.image.src = 'img/coin.png';
	}
	draw(){
		this.p1 = (0.9*c.height-noise(position+this.position.x)*0.6);
		this.p2 = (0.9*c.height-noise(position+5+this.position.x)*0.6);

		
		this.grounded = 0;
		const makeGrounded = () =>{
			this.position.y = this.p1-40; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 1 : makeGrounded();

		this.position.y += this.ySpeed;

		this.position.x -= speed;
		
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.drawImage(this.image,-30,-30,this.width,this.height);
		ctx.restore();
	}
}

var coins = {
	allCoins : [],
	add: ()=>{
		if (coins.allCoins.length < 200) {
			coins.allCoins.push(new coin((coins.allCoins.length) * ((Math.random() * 1000) + 100)));
		}
		coins.allCoins.forEach((item)=> item.draw());
	},
	collide: ()=>{
		coins.allCoins.forEach((item,index,arr)=>{
		if (item.position.x <= (player.position.x+player.width) && (item.position.x+item.width) >= player.position.x && item.position.y >= (player.position.y-player.height) && (item.position.y-item.height) <= player.position.y){
			bg.dashboard.saveCoins();
			arr.splice(index,1);
		}
	});
	}
};

class feul {
	constructor(xPos) {
		this.ySpeed = 0;
		this.position = {x:xPos,y:0};
		this.width = 50,this.height = 50;
		this.image = new Image;
		this.image.src = 'img/feul.png';
	}
	draw(){
		this.p1 = (0.9*c.height-noise(position+this.position.x)*0.6);
		this.p2 = (0.9*c.height-noise(position+5+this.position.x)*0.6);

		
		this.grounded = 0;
		const makeGrounded = () =>{
			this.position.y = this.p1-40; // remove initail bounce
			this.grounded = 1; //staying on ground
		}

		this.p1 > (this.position.y+15) ? this.ySpeed += 1 : makeGrounded();

		this.position.y += this.ySpeed;

		this.position.x -= speed;
		
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.drawImage(this.image,-30,-30,this.width,this.height);
		ctx.restore();
	}
}

var feuls = {
	allfeuls : [],
	add: ()=>{
		if (feuls.allfeuls.length < 30) {
			feuls.allfeuls.push(new feul((feuls.allfeuls.length) * ((Math.random() * 1000) + 100)));
		}
		feuls.allfeuls.forEach((item)=> item.draw());
	},
	collide: ()=>{
		feuls.allfeuls.forEach((item,index,arr)=>{
		if (item.position.x <= (player.position.x+player.width) && (item.position.x+item.width) >= player.position.x && item.position.y >= (player.position.y-player.height) && (item.position.y-item.height) <= player.position.y){
			bg.dashboard.saveFuel();
			arr.splice(index,1);
		}
	});
	}
};


// Objects
class Object {
	constructor(x){
		this.x = x;
		this.position = {x:this.x, y: 0}
		this.image = new Image;
		this.image.src = 'img/objects/'+Math.floor(Math.random()*10+1)+'.png';
	}

	draw(){
		this.p1 = (0.9*c.height-noise(this.x)*0.6);
		this.position.y = this.p1-this.image.height+35;
		this.position.x -= speed;

		ctx.save();
		ctx.drawImage(this.image,this.position.x,this.position.y);
		ctx.restore();

	}
}
var objects = {
    allObjects: [],
    add: () => {
        if (objects.allObjects.length < 100) {
            objects.allObjects.push(new Object((objects.allObjects.length) * ((Math.random() * 1000) + 200)));
        }
        objects.allObjects.forEach((item) => item.draw());
    }
};

// functions of keyboard clicks

const keyDown =()=>{
	window.addEventListener('keydown', e => {
		switch(e.keyCode){
			case keys[1]: speed < 5 ? (acc = 0.05,player.rSpeed=(1.5*speed)) : acc=0;break;
			case keys[0]: position > 0 ? (speed > -2.5? (acc = -0.05,player.rSpeed=(1.5*speed)) : acc=0): (acc = 0,speed=0,position=0);break;
		}
	});
}

window.addEventListener('keyup', e => {
	switch (e.keyCode){
		case keys[1]: {
					var interval1 = setInterval(()=>{
							window.addEventListener('keydown',()=> clearInterval(interval1),keyDown());
							speed !== 0 ? acc=Math.sign(-speed)*0.025 : (acc= 0,speed = 0,clearInterval(interval1));
						},10);
					};break;
		case keys[0]: {
					var interval2 = setInterval(()=>{
							window.addEventListener('keydown',()=> clearInterval(interval2),keyDown());
							speed !== 0 ? acc = Math.sign(-speed)*0.025 : (acc= 0,clearInterval(interval2));
						},10);
					};break;
		}
	});


// motion of car  
const loop =(time)=>{
	ctx.clearRect(0, 0, c.width, c.height);
	bg.time.start(time);
	
	bg.sky.draw();
	objects.add();
	bg.tile.draw();
	bg.dashboard.show();
	player.draw();
	coins.add();
	coins.collide();
	feuls.add();
	feuls.collide();
		// End the game if fuel is 0
		if (localStorage.feuls <= 0) {
			localStorage.feuls = 0; // Ensure fuel doesn't go negative
			game.state = 0; // Stop the game loop
			modal.open();
			modalBox.children[0].innerHTML =
				"Game Over! <br> Your fuel is depleted. <br> You collected " +
				localStorage.coins +
				" coins.";
		}
	game.state ? requestAnimationFrame(loop): cancelAnimationFrame(loop);
	bg.time.end(time);
}
loop();
