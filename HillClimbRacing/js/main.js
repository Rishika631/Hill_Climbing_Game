const c = document.getElementById('canvas');
c.width = window.innerWidth;
c.height =  window.innerHeight; 
const ctx = c.getContext('2d');
const p = document.getElementById('p');
const modalBox = document.getElementsByClassName('modal')[0];

window.addEventListener('resize',()=>c.width = window.innerWidth);

// local storage will be changed to backend logic.
if(typeof(localStorage.coins) == "undefined" || localStorage.coins == "NaN"){
	localStorage.setItem('coins',0);
}

if(typeof(localStorage.fuels) == "undefined" || localStorage.fuels == "NaN"){
	localStorage.setItem('fuels',100);
}
if (typeof localStorage.highScore === "undefined" || localStorage.highScore === "NaN") {
    localStorage.setItem("highScore", 0);
}

let keys = [37,39,38,40];
let acc = 0;
let speed = 0;
let position = 0;

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
	open(){
		modalBox.style.display='grid';
	}
	close(){
		modalBox.style.display='none';
	}
	gameloss(){
		modalBox.children[0].innerHTML = "Game Over! <br> You have "+localStorage.coins+ " coins";
	}
}

const modal = new modals();
const bgm = new Audio('sounds/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.2;

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
		fuels.allFuels = [];
		objects.allObjects = [];
		player.rSpeed = 0;
		bg.coinCount=0;
		player.ySpeed = 0;
		localStorage.coins = 0;
        localStorage.fuels = 100;
	}
	start(){
		this.state = 1;
		this.reset();
		modal.close();
		bgm.play();
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

		let currentTheme = "default";
		const themes = ["default","snow"];
		let currentIndex = 0;

class background{
	constructor(){
		this.images = [
            { sky: 'img/background.png', tile: 'img/tile.png' },
            { sky: 'img/background2.jpg', tile: 'img/tile2.png' }
        ];
		this.skyImage = new Image();
        this.tileImage = new Image();
		this.updateImages();
		this.checkpoints = []; 
        this.nextCheckpoint = 5000; 
        this.createCheckpoints();
		this.time = { 
			lastTime: 0,
			start: (currentTime)=>{
				this.deltaTime = currentTime - this.lastTime;
				position += speed,speed += acc;
			},
			end: (currentTime)=>{
				this.lastTime = currentTime;
			}
		};
		this.dashboard = { 
			text: (color,text,x,y)=>{
			 	ctx.font="40px dashboard";
			 	ctx.fillStyle = color;
			 	ctx.fillText(text,x,y);
			},
			show: ()=>{
				this.dashboard.text('#ff4d4d',"High Score: " + localStorage.highScore,50,50); 
				this.dashboard.text('#ff4d4d',Math.round(Math.abs(speed))+' km/h',c.width-300,50); 
				this.coinImg = new Image();
				this.coinImg.src = 'img/coin.png';
				ctx.drawImage(this.coinImg,50,70,30,30);
				this.dashboard.text('#fde318',localStorage.coins,100,100);
				this.fuelImg = new Image;
				this.fuelImg.src = 'img/fuel.png';
				ctx.drawImage(this.fuelImg,c.width-340,75,30,30);
			},
			saveCoins: () => {
				localStorage.coins = ((parseInt(localStorage.coins)) + 1);
			},
			saveFuel: () => {
				let currentFuel = (parseInt(localStorage.fuels));
				currentFuel += 10;
				if (currentFuel > 100) {
    				currentFuel = 100;
				}
				localStorage.fuels=currentFuel;
			}
		};
		this.sky = { 
			draw: () => {
				ctx.clearRect(0, 0, c.width, c.height);
				ctx.drawImage(this.skyImage, 0, 0, c.width, c.height); 
			}
		};

		this.tile = {
			draw: ()=>{
				ctx.drawImage(this.tileImage,0,0,0,c.height,0,0,0,c.height); 
					for(let i = 0;i < c.width;i++) ctx.drawImage(this.tileImage,i,(0.9*c.height-noise(i+position)*0.7));		
			}}
	}
	updateImages() {
        this.skyImage.src = this.images[currentIndex].sky;
        this.tileImage.src = this.images[currentIndex].tile;
    }
	createCheckpoints() {
        for (let i = 1; i <= 20; i++) { 
            this.checkpoints.push(i * 5000);
        }
	}
	drawFuelBar() {
		const fuelBarWidth = 200; 
		const fuelBarHeight = 20; 
		const fuelBarX = c.width-300; 
		const fuelBarY = c.height/9; 
		const maxFuel = 100;
		const currentFuel = Math.min(parseInt(localStorage.fuels), maxFuel);
		const fuelProgress = currentFuel / maxFuel;
		ctx.fillStyle = "rgba(211, 211, 211, 0)";
		ctx.fillRect(fuelBarX, fuelBarY, fuelBarWidth, fuelBarHeight);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.strokeRect(fuelBarX, fuelBarY, fuelBarWidth, fuelBarHeight);
		ctx.fillStyle = "#eb3131";
		ctx.fillRect(fuelBarX, fuelBarY, fuelBarWidth * fuelProgress, fuelBarHeight);
	}
	
		drawProgressBar() {
			const progressBarWidth = c.width/3;
			const progressBarHeight = 20;
			const progressBarX = c.width/3;
			const progressBarY = c.height/20;
			
			const currentCheckpoint = 0; 
			const maxDistance = this.nextCheckpoint; 
			const progress = Math.min((position - currentCheckpoint) / (maxDistance - currentCheckpoint), 1);
	
			ctx.fillStyle = "rgba(211, 211, 211, 0)";
			ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2; 
			ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
	
			ctx.fillStyle = "#4caf50";
			ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
	
			ctx.font = "30px Arial";
			ctx.fillStyle = "#4caf50";
			ctx.fillText(`Checkpoint: ${Math.round(position)} / ${maxDistance} m`, progressBarX+progressBarX/6, progressBarY - 5);
		}
		showCheckpointImage(duration) {
			const checkpointImage = new Image();
			checkpointImage.src = 'img/checkpoints.png';
		
			const startTime = performance.now();
		
			const drawImage = (currentTime) => {
				const elapsedTime = currentTime - startTime;
				if (elapsedTime < duration) {
					ctx.save();
					ctx.drawImage(checkpointImage, c.width/2-100, c.height/10, c.width/8, 80);
					ctx.restore();
					requestAnimationFrame(drawImage);
				}
			};
		
			checkpointImage.onload = () => {
				requestAnimationFrame(drawImage);
			};
		}
	
		checkCheckpoint() {
			if (position >= this.nextCheckpoint) {
				this.nextCheckpoint = this.checkpoints.shift() || this.nextCheckpoint +5000;
				currentIndex = (currentIndex+1) % this.images.length; 
				console.log("helloooooo",currentIndex);
				console.log("helloooooo",this.nextCheckpoint);
				if(this.nextCheckpoint==5000)
				{
					currentIndex = (currentIndex+1) % this.images.length;
				}
				this.updateImages();
				currentTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
				if(this.nextCheckpoint==5000)
				{
					currentTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
				}
				objects.changeTheme(currentTheme);
				localStorage.fuels = Math.min(parseInt(localStorage.fuels) + 10, 100); 
				localStorage.coins = parseInt(localStorage.coins) + 5;
				this.showCheckpointImage(2000);
			}
		}
}

const bg = new background();
const coinCollectSound = new Audio('sounds/coin.mp3');
const fuelCollectSound = new Audio('sounds/fuel.mp3');

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
		const wheelRadius = 40;
		this.frontWheel = new Wheel(this.position.x, this.position.y-30, wheelRadius, 'img/Cars/wheel1.png');
		this.rearWheel = new Wheel(this.position.x, this.position.y + 25, wheelRadius, 'img/Cars/wheel2.png');

		this.carMoveSound = new Audio('sounds/carmoving.mp3');
		this.carMoveSound.loop = true;  
		this.carMoveSound.volume = 0.07;
	}
	draw(){
		this.p1 = (0.9*c.height-noise(position+this.position.x)*0.7);
		this.p2 = (0.9*c.height-noise(position+5+this.position.x)*0.7);
		this.grounded = 0;
		const makeGrounded = () =>{
			this.ySpeed -= this.position.y -(this.p1-15); 
			this.position.y = this.p1-15; 
			this.grounded = 1; 
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
		let headTilt = Math.sign(speed) * Math.min(Math.abs(speed) / 8, Math.PI / 8);
		this.rot -= this.rSpeed/20;
		ctx.save();
		ctx.translate(this.position.x,this.position.y);
		ctx.rotate(this.rot);
		ctx.drawImage(this.image,-15,-100,2*this.width,2*this.height);


		this.frontWheel.position.x = 140;
		this.frontWheel.position.y = 0;
		
		this.rearWheel.position.x = 5;
		this.rearWheel.position.y = 0;

		this.frontWheel.rotate(20*speed);
		this.frontWheel.draw(ctx);
		
		this.rearWheel.rotate(20*speed);
		this.rearWheel.draw(ctx);
    ctx.save();
    ctx.translate(this.width / 2, -120); 
    ctx.rotate(headTilt);
    ctx.drawImage(this.head, -this.width/3, -15, this.width, 40);
    ctx.restore();

    ctx.restore();
	if (Math.round(Math.abs(speed)) > 0 && !this.carMoveSound.isPlaying) {
		this.carMoveSound.play(); 
		if (game.state === 0) {
			this.carMoveSound.pause();  
			this.carMoveSound.currentTime = 0; 
		}
	}else if (Math.round(Math.abs(speed)) === 0) {
		this.carMoveSound.pause();  
		this.carMoveSound.currentTime = 0; 
	}
		if (localStorage.fuels > 0) {
			localStorage.fuels -= speed * 0.04; 
		} else {
			localStorage.fuels = 0;  
		}
	}
}
let player = new play();

class coin {
	constructor(xPos) {
		this.ySpeed = 0;
		this.position = {x:xPos,y:0};
		this.width = 50,this.height = 50;
		this.image = new Image;
		this.image.src = 'img/coin.png';
	}
	draw(){
		this.p1 = (0.9*c.height-noise(position+this.position.x)*0.7);
		this.p2 = (0.9*c.height-noise(position+5+this.position.x)*0.7);

		
		this.grounded = 0;
		const makeGrounded = () =>{
			this.position.y = this.p1-40; 
			this.grounded = 1; 
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
			coinCollectSound.play();
			bg.dashboard.saveCoins();
			arr.splice(index,1);
		}
	});
	}
};

class fuel {
	constructor(xPos) {
		this.ySpeed = 0;
		this.position = {x:xPos,y:0};
		this.width = 50,this.height = 50;
		this.image = new Image;
		this.image.src = 'img/fuel.png';
	}
	draw(){
		this.p1 = (0.9*c.height-noise(position+this.position.x)*0.7);
		this.p2 = (0.9*c.height-noise(position+5+this.position.x)*0.7);

		
		this.grounded = 0;
		const makeGrounded = () =>{
			this.position.y = this.p1-40; 
			this.grounded = 1; 
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

var fuels = {
	allFuels : [],
	add: ()=>{
		if (fuels.allFuels.length < 30) {
			fuels.allFuels.push(new fuel((fuels.allFuels.length) * ((Math.random() * 1000) + 100)));
		}
		fuels.allFuels.forEach((item)=> item.draw());
	},
	collide: ()=>{
		fuels.allFuels.forEach((item,index,arr)=>{
		if (item.position.x <= (player.position.x+player.width) && (item.position.x+item.width) >= player.position.x && item.position.y >= (player.position.y-player.height) && (item.position.y-item.height) <= player.position.y){
			fuelCollectSound.play();
			bg.dashboard.saveFuel();
			arr.splice(index,1);
		}
	});
	}
};

class Object {
	constructor(x){
        this.x = x;
        this.position = { x: this.x, y: 0 };
        this.image = new Image();
        this.setRandomImage();
	}
	setRandomImage() {
        const themes = {
            default: "img/objects/default/",
            snow: "img/objects/snow/"
        };
		const folder = themes[currentTheme];
        this.image.src = `${folder}${Math.floor(Math.random() * 10 + 1)}.png`;
    }


	draw(){
		this.p1 = (0.9*c.height-noise(this.x)*0.7);
		this.position.y = this.p1-this.image.height;
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
    },
		changeTheme: (newTheme) => {
			objects.allObjects.forEach((item) => item.setRandomImage(newTheme));
		},
};


const keyDown = () => {
    window.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
            case keys[1]: // Right arrow
                speed < 5 ? (acc = 0.05, player.rSpeed = (1.4 * speed)) : acc = 0;
                break;
            case keys[0]: // Left arrow
                position > 0
                    ? (speed > -2.5
                        ? (acc = -0.05, player.rSpeed = (1.4 * speed))
                        : acc = 0)
                    : (acc = 0, speed = 0, position = 0);
                break;
        }
    });
};

window.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
        case keys[1]: {
            var interval1 = setInterval(() => {
                window.addEventListener('keydown', () => clearInterval(interval1), keyDown());
                speed !== 0 ? acc = Math.sign(-speed) * 0.025 : (acc = 0, speed = 0, clearInterval(interval1));
            }, 10);
        }; break;
        case keys[0]: {
            var interval2 = setInterval(() => {
                window.addEventListener('keydown', () => clearInterval(interval2), keyDown());
                speed !== 0 ? acc = Math.sign(-speed) * 0.025 : (acc = 0, clearInterval(interval2));
            }, 10);
        }; break;
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
	fuels.add();
	fuels.collide();
	bg.drawFuelBar();
	bg.drawProgressBar();
    bg.checkCheckpoint();
		if (localStorage.fuels <= 0) {
			localStorage.fuels = 0; 
			game.state = 0;
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
