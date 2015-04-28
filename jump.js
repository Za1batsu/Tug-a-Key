
var gameSett = {
  width: window.innerWidth,
  height: window.innerHeight,
  auto: false,
  hideKey2: false,
  gameOver: false,
  key1: 0,
  key2: 0,
  keyPress1: false,
  keyPress2: false,
  charge: 0,
  linkLeftDist: (window.innerWidth/10)*2,
  linkRightDist: (window.innerWidth/10)*2,
  linkLoss: 10,
  pull: 20,
  radius: 10,
  nodes: [
    { id: '1',
      x: 0, y: window.innerHeight/2 },
    { id: '0',
      x: window.innerWidth/2, y: window.innerHeight/2 },
    { id: '2',
      x: window.innerWidth, y: window.innerHeight/2 }
  ],
  links: [
    { source: 0, target: 1 },
    { source: 2, target: 1 }
  ]
};

var keyCodes = {
  81: 'Q',        221:']',
  65: 'A',        222:'"',
  90: 'Z',        191:'/'
};

var force = d3.layout.force()
            .size([gameSett.width, gameSett.height])
            .gravity(0)
            .charge(gameSett.charge)
            .linkDistance(function(d) { 
              if(d.source.id === '1'){ return gameSett.linkLeftDist; }
              else if(d.source.id === '2'){ return gameSett.linkRightDist; }
            })
            .on('tick', tick);

var svg = d3.select('body').append('svg')
          .attr('width', gameSett.width)
          .attr('height', gameSett.height);

if(!gameSett.auto){
  var leftKey = svg.append('text') 
                 .attr('x', gameSett.width/6)
                 .attr('y', gameSett.height/6)
                 .attr('class', 'leftKey');
  var rightKey = svg.append('text') 
                 .attr('x', (gameSett.width/6)*4.5)
                 .attr('y', gameSett.height/6)
                 .attr('class', 'rightKey');
}

function randomKey(prevKeyCode) {
  var codes = Object.keys(keyCodes);
  var rand = Math.floor((Math.random()*6));

  while(prevKeyCode === codes[rand].toString()){
    rand = Math.floor((Math.random()*6));
  }
  return Object.keys(keyCodes)[rand];
}

var changeKey = function(){
  d3.select('.leftKey')
    .text(function() {
      gameSett.key1 = randomKey(gameSett.key1);
      return keyCodes[gameSett.key1];} );
  d3.select('.rightKey')
    .text(function() {
      if(!gameSett.hideKey2){
        gameSett.key2 = randomKey(gameSett.key2);
        return keyCodes[gameSett.key2];
      }else{ return String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0x30A0+1)); }
    });

  while(gameSett.key1 === gameSett.key2){
    changeKey();
  }
};

var link = svg.selectAll('.link');
var node = svg.selectAll('.node');

function tick(){
link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

//force.start();
}
//'z' = 90
//'/' = 191
d3.select('body')
.on('keydown', function(){
  if(!gameSett.gameOver){ 
    if(d3.event.keyCode.toString() === gameSett.key1 && !gameSett.keyPress1){
      gameSett.keyPress1 = true;
      pull(d3.select('.player1'), d3.select('.link2'), true);
    }else if(d3.event.keyCode.toString() === gameSett.key2 && !gameSett.keyPress2){
      gameSett.keyPress2 = true;
      pull(d3.select('.player2'), d3.select('.link1'), false);
    } if(d3.event.keyCode === 192){
      gameSett.hideKey2 = !gameSett.hideKey2;
      changeKey();
    }
  }
}).on('keyup', function(){
  if(!gameSett.gameOver){ 
    if(d3.event.keyCode.toString() === gameSett.key1 && gameSett.keyPress1){
      gameSett.keyPress1 = false;
    }else if(d3.event.keyCode.toString() === gameSett.key2 && gameSett.keyPress2){
      gameSett.keyPress2 = false;
    }
  }
});

var pull = function(node, link, toLeft) {

  if(toLeft){
    //console.log(node);
    node.attr('cx', function(d) { return d.x-=gameSett.pull; } )
        .attr('cy', function(d) { return d.y+=(Math.random()-0.5)*2; } )
        .call(force.drag);

    force.stop();
    if(gameSett.linkRightDist > 0){
      gameSett.linkRightDist -= gameSett.linkLoss;
      gameSett.linkLeftDist += gameSett.linkLoss;
    }
    else{
      svg.append('text')
         .attr('x', gameSett.width/2-150)
         .attr('y', 100)
         .style("font-size","50px")
         .text('Player 1 WINS!')
         .transition().duration(1500)
            .style("fill-opacity",".1")
          .remove();
      gameSett.gameOver = true;
    }
  }else{
     node.attr('cx', function(d) { return d.x+=gameSett.pull; } )
         .attr('cy', function(d) { return d.y+=(Math.random()-0.5)*2; } )
         .call(force.drag);

    force.stop();
    if(gameSett.linkLeftDist > 0){
      gameSett.linkLeftDist -= gameSett.linkLoss;
      gameSett.linkRightDist += gameSett.linkLoss;
    }
    else{
      svg.append('text')
         .attr('x', gameSett.width/2-150)
         .attr('y', 100)
         .style("font-size","50px")
         .text('Player 2 WINS!')
         .transition().duration(1500)
            .style("fill-opacity",".1")
          .remove();

      gameSett.gameOver = true;
    }
  }


  force.start();
};

var update = function(){
  console.log('update');
  changeKey();
};

var autoUpdate = function(){
  if(!gameSett.gameOver){
    var rand1 = Math.floor(Math.random()*2);
    var rand2 = Math.floor(Math.random()*2);
    if(rand1 === 0){
      gameSett.linkLoss = Math.floor(Math.random()*20+15);
      pull(d3.select('.player1'), d3.select('.link2'), true);    
    }
    if(rand2===0){
      gameSett.linkLoss = Math.floor(Math.random()*20+15);
      pull(d3.select('.player2'), d3.select('.link1'), false);
    }
  } 
};



var init = function(){

  if(!gameSett.auto){
    changeKey();
  }

  force
      .nodes(gameSett.nodes)
      .links(gameSett.links)
      .start();

  link = link.data(gameSett.links)
      .enter().append("line")
      .attr("class", function(d){ return 'link'+d.source.id; });

  node = node.data(gameSett.nodes);

  node.enter().append('circle')
    .attr('class', function(d) {  
      if(d.id === '0'){ d.fixed = true; return 'goal';}
      //d.fixed = true;
      return 'player'+d.id; })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", gameSett.radius)
    .call(force.drag);

};

init();

if(!gameSett.auto) {
  setInterval(update, 5000);
}else{
  setInterval(autoUpdate, 100);
}










