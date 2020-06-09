window.onload = function() {
	let canvasWidth = 900;
	let canvasHeight = 600;
	let blockSize = 30;
	let ctx;
	let delay = 100;
	let snake;
	let apple; 
	let widthInBlocks = canvasWidth/blockSize;
	let heightInBlocks = canvasHeight/blockSize;
	let score;
	let timeOut;
	
	init();
	
	function init() {
		let canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "30px solid gray";
		canvas.style.margin = "50px auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#ddd";
		document.body.appendChild(canvas);
		ctx = canvas.getContext('2d');
		snake = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]], "right");
		apple = new Apple([10,10]);
		score = 0;
		refreshCanvas();
	}
	
	function refreshCanvas() {
		snake.advance();
		if (snake.checkCollision()) {
			gameOver();
		} else {
			if (snake.isEatingApple(apple)) {
				score++;
				snake.ateApple = true;
				do {
					apple.setNewPosition(); 
				} while(apple.isOnSnake(snake));
			}
			ctx.clearRect(0,0,canvasWidth,canvasHeight);
			drawScore();
			snake.draw();
			apple.draw();
			timeOut = setTimeout(refreshCanvas, delay);
		}
	}
	
	function gameOver() {
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		let centreX = canvasWidth / 2;
		let centreY = canvasHeight / 2;
		ctx.strokeText("Game Over", centreX, centreY - 180);
		ctx.fillText("Game Over", centreX, centreY - 180);
		ctx.font = "bold 30px sans-serif";
		const line1 = `Espace pour rejouer`;
		const line2 = `Entrée pour conserver l'aperçu de votre partie`;
		const line3 = `Appuyez plusieurs fois sur Entrée`;
		const line4 = `pour augmenter la vitesse`;
		ctx.strokeText(line1, centreX, centreY - 120);
		ctx.fillText(line1, centreX, centreY - 120);
		ctx.strokeText(line2, centreX, centreY - 90);
		ctx.fillText(line2, centreX, centreY - 90);
		ctx.strokeText(line3, centreX, centreY - 60);
		ctx.fillText(line3, centreX, centreY - 60);
		ctx.strokeText(line4, centreX, centreY - 30);
		ctx.fillText(line4, centreX, centreY - 30);
		ctx.restore();
	}
	
	function restart() {
		snake = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]], "right");
		apple = new Apple([10,10]);
		score = 0;
		clearTimeout(timeOut);
		refreshCanvas();
	}
	
	function drawScore() {
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		let centreX = canvasWidth / 2;
		let centreY = canvasHeight / 2;
		ctx.fillText(score.toString(), centreX, centreY);
		ctx.restore();
	}
	
	function drawBlock(ctx, position) {
		let x = position[0] * blockSize;
		let y = position[1] * blockSize;
		ctx.fillRect(x, y, blockSize, blockSize);
	}
	
	function Snake(body, direction) {
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		
		this.draw = function() {
			ctx.save();
			ctx.fillStyle="#ff0000";
			for (let i = 0; i < this.body.length; i++) {
				drawBlock(ctx, this.body[i]);
			}
			ctx.restore();
		}
		
		this.advance = function() {
			let nextPosition = this.body[0].slice();
			switch(this.direction) {
				case "left":
					nextPosition[0] -= 1;
					break;
				case "right":
					nextPosition[0] += 1;
					break;
				case "down":
					nextPosition[1] += 1;
					break;
				case "up":
					nextPosition[1] -= 1;
					break;
				default:
					throw("invalid direction");
			}
			this.body.unshift(nextPosition);
			if (!this.ateApple) {
				this.body.pop();
			}
			else {
				this.ateApple = false;
			}
		}
		
		this.setDirection = function(newDirection = "right") {
			let allowedDirections;
			switch(this.direction) {
				case "left":
				case "right":
					allowedDirections=["up","down"];
					break;
				case "down":
				case "up":
					allowedDirections=["left","right"];
					break;  
			   default:
					throw("invalid direction");
			}
			if (allowedDirections.indexOf(newDirection) > -1) {
				this.direction = newDirection;
			}
		}
		
		this.checkCollision = function() {
			let wallCollision = false;
			let snakeCollision = false;
			let head = this.body[0];
			let rest = this.body.slice(1);
			let snakeX = head[0];
			let snakeY = head[1];
			let minX = 0;
			let minY = 0;
			let maxX = widthInBlocks - 1;
			let maxY = heightInBlocks - 1;
			let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
			
			if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
				wallCollision = true;
			}
			
			for (let i=0 ; i<rest.length ; i++) {
				if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
					snakeCollision = true;
				}
			}
			
			return wallCollision || snakeCollision;
		}
		
		this.isEatingApple = function(appleToEat) {
			let head = this.body[0];
			return (head[0] === appleToEat.position[0]) && (head[1] === appleToEat.position[1]);
		}
		
	}
	
	function Apple(position) {
		this.position = position;
		
		this.draw = function() {
			ctx.save();
			ctx.fillStyle = "#33cc33";
			ctx.beginPath();
			let radius = blockSize / 2;
			let x = this.position[0] * blockSize + radius;
			let y = this.position[1] * blockSize + radius;
			ctx.arc(x, y, radius, 0, Math.PI*2, true);
			ctx.fill();
			ctx.restore();
		}
		
		this.setNewPosition = function() {
			let newX = Math.round(Math.random() * (widthInBlocks - 1));
			let newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX,newY];
		}
		
		this.isOnSnake = function(snakeToCheck) {
			let isOnSnake = false;
			for (let i = 0; i < snakeToCheck.body.length; i++) {
				if ((this.position[0] === snakeToCheck.body[i][0]) && (this.position[1] === snakeToCheck.body[i][1])) {
					isOnSnake = true;
				}
			}
			return isOnSnake;
		}
	}
	
	document.onkeydown = function handleKeyDown(e) {
		let newDirection;
		
		if (e.preventDefaulted) {
			return;
		}
		switch(e.code) {
			case "KeyS":
			case "ArrowDown":
				newDirection = "down";
				break;
			case "KeyW":
			case "ArrowUp":
				newDirection = "up";
				break;
			case "KeyA":
			case "ArrowLeft":
				newDirection = "left";
				break;
			case "KeyD":
			case "ArrowRight":
				newDirection = "right";
				break;
			case "Space":
				restart();
				break;
			case "Enter":
				init();
				document.body.scrollIntoView({block: "end"});
				break;
		}
		e.preventDefault();
		snake.setDirection(newDirection);
	}
}
