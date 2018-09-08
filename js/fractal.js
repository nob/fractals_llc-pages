var canvas=document.getElementById("c");
var $=canvas.getContext("2d");
// var W = canvas.width = window.innerWidth;
// var H = canvas.height = window.innerHeight;
var wrap=document.getElementById("canvas-wrap");
var W = canvas.width = wrap.clientWidth;
var H = canvas.height = wrap.clientHeight;
console.log(W);
console.log(H);

var right=Math.PI/2;
var backgroundColor="rgb(249, 241, 230)";
var blue="#23567b";

function reset(x, y){
	$.setTransform(1, 0, 0, 1, 0, 0); // reset
	$.translate(x, y);
	$.rotate(-1*Math.PI/2);
}

function background(){
	$.setTransform(1, 0, 0, 1, 0, 0); // reset
	$.fillStyle=backgroundColor;
	$.fillRect(0, 0, W, H);
}
function rotate(rotation){
	$.rotate(rotation);
}

function line(x, y, rotation, length){
	reset(W/2+x, H/2+y);
	rotation*=right;
	$.rotate(rotation);
	$.beginPath();
	$.moveTo(0,0);
	$.lineTo(0, length);
	$.stroke();
}

function drawFractal(iterations, finalLengthPercentage){
	function drawPart(x, y, rotation, length, i, stay){
		//some really bad, not-optimalized code :/
		if(i==0){
			line(x, y, rotation, stay? length : length*finalLengthPercentage);
		}else{
			line(x, y, rotation, vars.where*length);
			if(rotation==0){
				drawPart(x+vars.where*length, y, 3, vars.scaleLength*length,i-1);
				drawPart(x+vars.where*length, y, 0, (1-vars.where)*length,i-1, true);
				drawPart(x+vars.where*length, y, 1, vars.scaleLength*length,i-1);
			}
			if(rotation==2){
				drawPart(x-vars.where*length, y, 1, vars.scaleLength*length, i-1);
				drawPart(x-vars.where*length, y, 2, (1-vars.where)*length, i-1, true);
				drawPart(x-vars.where*length, y, 3, vars.scaleLength*length, i-1);
			}
			if(rotation==1){
				drawPart(x, y+vars.where*length, 0, vars.scaleLength*length, i-1);
				drawPart(x, y+vars.where*length, 1, (1-vars.where)*length, i-1, true);
				drawPart(x, y+vars.where*length, 2, vars.scaleLength*length, i-1);
			}
			if(rotation==3){
				drawPart(x, y-vars.where*length, 2, vars.scaleLength*length, i-1);
				drawPart(x, y-vars.where*length, 3, (1-vars.where)*length, i-1, true);
				drawPart(x, y-vars.where*length, 0, vars.scaleLength*length, i-1);
			}
		}
	}

	drawPart(0, 0, 0, length, iterations);
	drawPart(0, 0, 1, length, iterations);
	drawPart(0, 0, 2, length, iterations);
	drawPart(0, 0, 3, length, iterations);
}



var now=0 // recursion level

var length=Math.min(W/2.5, H/2.5) // base length
var vars={
	where:0.5, // where to put new iteration (0=begin, 1=end)
	scaleLength:0.5 // scale every line with
}

// animate from one recursion level to another
function drawTo(to, stay, cb){
	var reverse=false;
	if(to<now){reverse=true}
	function d(){
		function update(){
			background();
			reset(W/2, H/2);
			$.strokeStyle=blue;
			drawFractal(now, args.finalLength);
		}

		if(now==to){
			var args={finalLength:reverse?1:0}
			TweenLite.to(args, stay, {
				finalLength:reverse?0:1,
				onUpdate:update,
				ease:Power3.easeOut,
				onComplete:function(){
					cb && cb()
				}
			});
		}
		else if(now<to){
			var args={finalLength:0};
			TweenLite.to(args, stay, {
				finalLength:1,
				onUpdate:update,
				ease:Power3.easeOut,
				onComplete:function(){
					now+=1
					console.log("now", now)
					d(now)
				}
			});
		}else{
			var args={finalLength:1}
			TweenLite.to(args, stay, {
				finalLength:0,
				onUpdate:update,
				ease:Power3.easeOut,
				onComplete:function(){
					now-=1
					console.log("now", now)
					d(now)
				}
			});
		}
	}
	d();
}

// animate width-var + scaleLength var
function sequence(arrayW, arrayS, cb){
	function updateDrawing(){
		background()
		reset(W/2, H/2)
		$.strokeStyle=blue
		drawFractal(now, 1)
	}

	if(arrayW.length==0){
		cb && cb()
		return
	}
	var w=arrayW.shift()
	var s=arrayS.shift()

	TweenLite.to(vars, 5, {
		where:w,
		scaleLength:s,
		onUpdate:updateDrawing,
		ease:Power2.easeInOut,
		onComplete:function(){
			sequence(arrayW, arrayS, cb)
		}
	})
}


function playAnimation(){
	drawTo(6, 1.2, function(){ // animate to 6
		sequence( // breathing (:
			[0.6, 0.35, 0.5], // where-var
			[0.5, 0.4, 0.5], // scaleLength-var
			function(){
				drawTo(0, 1.2, playAnimation)
			}
		)
	})
}

setTimeout(playAnimation, 1000)