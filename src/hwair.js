//////
// hwair.js
//////
// Utilidades para Board Wars
////
var hw = {};

//Colores de celda predefinidos
hw.white = cc.p(0,0);
hw.black = cc.p(0,96);
hw.dis = cc.p(0,192);
hw.red = cc.p(192,0);
hw.green = cc.p(192,96);
hw.blue = cc.p(192,192);
hw.magenta = cc.p(384,0);
hw.yellow = cc.p(384,96);
hw.cyan = cc.p(384,192);
hw.darkred = cc.p(576,0);
hw.darkgreen = cc.p(576,96);
hw.darkblue = cc.p(576,192);

// Símbolos predefinidos
hw.cell = cc.p(0,0);
hw.plus = cc.p(32,0);
hw.rombe = cc.p(64,0);
hw.cross = cc.p(96,0);
hw.chacana = cc.p(128,0);
hw.valcamo = cc.p(160,0);
hw.block = cc.p(32,32);
hw.glider = cc.p(64,32);
hw.maccom = cc.p(96,32);
hw.leafcross = cc.p(128,32);
hw.hourglass = cc.p(160,32);

// Dos puntos y un rectángulo
hw.pointRect = function (p1, p2) {
  var fpoint = cc.pAdd(p1, p2);
  return cc.rect(fpoint.x,fpoint.y,32,32);
}

// Especiales 
hw.gold = cc.rect(160,64,32,32);
hw.silver = cc.rect(160,96,32,32);
hw.gbullet = cc.rect(0,288,32,32);
hw.sbullet = cc.rect(0,320,32,32);
hw.grey = cc.rect(0,32,32,32);
hw.dotted = cc.rect(0,64,32,32);

hw.colour = [hw.red, hw.green, hw.blue, hw.magenta, hw.yellow, hw.cyan, hw.darkred, hw.darkgreen, hw.darkblue];
hw.symbol = [hw.plus, hw.rombe, hw.cross, hw.chacana, hw.valcamo, hw.block, hw.glider, hw.maccom, hw.leafcross, hw.hourglass];

//Botones
hw.buttons = [cc.rect(0,0,32,32), cc.rect(32,0,32,32), cc.rect(64,0,32,32), cc.rect(96,0,32,32)];
hw.actions = [cc.rect(0,64,32,32), cc.rect(32,64,32,32), cc.rect(64,64,32,32), cc.rect(96,64,32,32)];

hw.data = 3;
hw.data_sym = [0,1,2,3];

//Tipos de habilidades
hw.obj_contact = function (m)
{
  var nx, ny;
    
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  for (d = -1; d <= 1; d++)
  {
    for (e = -1; e <= 1; e++)
    {
      nx = ox + d;
      ny = oy + e;
      if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
        m[nx][ny].setTextureRect(hw.pointRect(hw.red,hw.cell));
    }
  }
};

hw.cmp_contact = function (m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var xx = Math.abs(ox - px) <= 1;
  var yy = Math.abs(oy - py) <= 1;
  
  return xx && yy;
}

hw.des_contact = function (m)
{
  var nx, ny;
    
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  for (d = -1; d <= 1; d++)
  {
    for (e = -1; e <= 1; e++)
    {
      nx = ox + d;
      ny = oy + e;
      if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
        m[nx][ny].setTextureRect(hw.pointRect(hw.white,hw.cell));
    }
  }
}

hw.cns_contact = function(m, px, py)
{
  var cx = px * 32+16;
  var cy = py * 32+16;
  var ox = Math.floor(this.getPosition().x/32)*32+16;
  var oy = Math.floor(this.getPosition().y/32)*32+16;
  
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.sbullet);
  bullet.setName("bullet");
  bullet.setPosition(ox,oy);
  this.getParent().addChild(bullet);
  var seq = cc.sequence(cc.moveBy(0.5, cx-ox, cy-oy), cc.delayTime(0.5), cc.removeSelf(), cc.callFunc(hw.create_menu,null,this));
  bullet.runAction(seq); 
}

hw.obj_junction = function (m)
{  
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    
    ny = oy + k;
    if (0 <= ox && ox < mat_size && 0 <= ny && ny < mat_size)
      m[ox][ny].setTextureRect(hw.pointRect(hw.green,hw.cell));
    
    nx = ox + k;  
    if (0 <= nx && nx < mat_size && 0 <= oy && oy < mat_size)
      m[nx][oy].setTextureRect(hw.pointRect(hw.green,hw.cell));
  }
}

hw.cmp_junction = function(m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var jx = ox == px
  var jy = oy == py;
  
  var xx = Math.abs(ox - px) <= 2;
  var yy = Math.abs(oy - py) <= 2;
  
  return (jx || jy) && (xx || yy);
}

hw.des_junction = function(m)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    
    ny = oy + k;
    if (0 <= ox && ox < mat_size && 0 <= ny && ny < mat_size)
      m[ox][ny].setTextureRect(hw.pointRect(hw.black,hw.cell));
    
    nx = ox + k;  
    if (0 <= nx && nx < mat_size && 0 <= oy && oy < mat_size)
      m[nx][oy].setTextureRect(hw.pointRect(hw.black,hw.cell));
  }
}

hw.cns_junction = function(m, px, py)
{
  //Posició a l'espai del món
  var cx = px * 32+16;
  var cy = py * 32+16;
  
  var ox = Math.floor(this.getPosition().x/32)*32+16;
  var oy = Math.floor(this.getPosition().y/32)*32+16;
  
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.gbullet);
  bullet.setName("bullet");
  bullet.setPosition(ox,oy);
  this.getParent().addChild(bullet);
  var seq = cc.sequence(cc.moveTo(0.5, cx, cy), cc.delayTime(0.5), cc.removeSelf(), cc.callFunc(hw.create_menu,null,this));
  bullet.runAction(seq);
  
}

hw.obj_diagonal = function (m)
{  
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    
    nx1 = ox - k;
    nx2 = ox + k;
    ny = oy + k;
    
    if (0 <= nx1 && nx1 < mat_size && 0 <= ny && ny < mat_size)
      m[nx1][ny].setTextureRect(hw.pointRect(hw.blue,hw.cell));
    
    if (0 <= nx2 && nx2 < mat_size && 0 <= ny && ny < mat_size)
      m[nx2][ny].setTextureRect(hw.pointRect(hw.blue,hw.cell));
  }
}

hw.cmp_diagonal = function(m, px, py)
{
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
 
  var jj = Math.abs(ox-px) == Math.abs(oy-py);
  
  var xx = Math.abs(ox - px) <= 2;
  var yy = Math.abs(oy - py) <= 2;
  
  return jj && (xx || yy);
}

hw.des_diagonal = function(m)
{
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    nx1 = ox - k;
    nx2 = ox + k;
    ny = oy + k;
    
    if (0 <= nx1 && nx1 < mat_size && 0 <= ny && ny < mat_size)
      m[nx1][ny].setTextureRect(hw.pointRect(hw.white,hw.cell));
    
    if (0 <= nx2 && nx2 < mat_size && 0 <= ny && ny < mat_size)
      m[nx2][ny].setTextureRect(hw.pointRect(hw.white,hw.cell));
  }
}

hw.cns_diagonal = function(m, px, py)
{
  //Posició a l'espai del món
  var cx = px * 32+16;
  var cy = py * 32+16;

  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32)*32+16;
  var oy = Math.floor(orig.y/32)*32+16;
  

  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.gbullet);
  bullet.setName("bullet");
  bullet.setPosition(ox,oy);
  base_node.addChild(bullet);
  var seq = cc.sequence(cc.moveTo(0.5, cx, cy), cc.delayTime(0.5), cc.removeSelf(), cc.callFunc(hw.create_menu,null,this));
  bullet.runAction(seq);
  
}

hw.obj_wave = function (m)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);

  if (this.state == "moving")
  {
    for (d = -1; d <= 1; d++) {
      for (e = -1; e <= 1; e++)
      {
        var nx = ox + d;
        var ny = oy + e;
        if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
          m[nx][ny].setTextureRect(hw.pointRect(hw.magenta,hw.cell));
      }
    }
    
  }
  else if (this.state == "selected")
  {
    var orig = this.getPosition();
    var ox = Math.floor(orig.x/32);
    var oy = Math.floor(orig.y/32);
  
    m[ox][oy].setTextureRect(hw.pointRect(hw.magenta,hw.cell));
  }
}

hw.cmp_wave = function (m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  if (this.state == "moving")
  {
    var xx = Math.abs(ox - px) <= 1;
    var yy = Math.abs(oy - py) <= 1;
  
    return xx || yy;  
  }
  else if (this.state == "selected")
  {
    var xx = ox == px;
    var yy = oy == py;

    return xx && yy;
  } 
}

hw.des_wave = function (m)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  if (this.state == "moving")
  {
    for (d = -1; d <= 1; d++) {
      for (e = -1; e <= 1; e++)
      {
        var nx = ox + d;
        var ny = oy + e;
        if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
          m[nx][ny].setTextureRect(hw.pointRect(hw.white,hw.cell));
      }
    }
    
  }
  else if (this.state == "selected")
  {
    m[ox][oy].setTextureRect(hw.pointRect(hw.white,hw.cell));   
  }
  
}

hw.cns_wave = function (m, px, py)
{
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32)*32+16;
  var oy = Math.floor(orig.y/32)*32+16;

  //var cx = ox * 32+16;
  //var cy = oy * 32+16;

  var locx = [0, 1, 1, 1, 0, -1, -1, -1];
  var locy = [1, 1, 0, -1, -1, -1, 0, 1];
  var seqs = new Array();
  var att = new Array();
  
  for (d = 0; d < locx.length; d++) {
    var nx = Math.floor(orig.x/32) + locx[d];
    var ny = Math.floor(orig.y/32) + locy[d];
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
    {
      var bullet = new cc.Sprite(texture);
      bullet.setPosition(ox,oy);
      bullet.setTextureRect(hw.gbullet);
      base_node.addChild(bullet);
      var cx = ox + locx[d]*32;
      var cy = oy + locy[d]*32;
      var seq = cc.sequence(cc.moveTo(0.5, cx, cy), cc.delayTime(0.5), cc.removeSelf());
      var targ = cc.targetedAction(bullet, seq);
      seqs.push(targ);
      att.push(cc.p(nx,ny));
    }
  }

  var spa = cc.sequence(cc.spawn(seqs), cc.callFunc(hw.create_menu,null,this));
  this.runAction(spa);
  return att;
}

hw.obj = [hw.obj_contact, hw.obj_junction, hw.obj_diagonal, hw.obj_wave];
hw.cmp = [hw.cmp_contact, hw.cmp_junction, hw.cmp_diagonal, hw.cmp_wave];
hw.des = [hw.des_contact, hw.des_junction, hw.des_diagonal, hw.des_wave];
hw.cns = [hw.cns_contact, hw.cns_junction, hw.cns_diagonal, hw.cns_wave];

hw.f1 = function(menu,target)
{
  return function()
  {
    this.removeChildByTag(100);
    target.state = "moving";
    target.objective(this.getParent().matrix);

    target.pos_act[0] = false;
    target.num_pos_act -= 1;
  }
};

hw.f2 = function(menu, target)
{
  return function()
  {
    this.removeChildByTag(100);
    target.state = "selected";
    target.objective(this.getParent().matrix);
    target.pos_act[1] = false;
    target.num_pos_act -= 1;
  }
};

hw.f3 = function(menu, target)
{
  return function()
  {
    this.removeChildByTag(100);
    target.state = "alone";
    target.pos_act[2] = false;
    target.num_pos_act -= 1;
  }
};

hw.f4 = function(menu, target)
{
  return function()
  {
    var parent = this.getParent();
    this.removeChildByTag(100);
    var orig = target.getPosition();
    var ix = Math.floor(orig.x/32);
    var iy = Math.floor(orig.y/32);
    //parent.matrix[ix][iy].setTextureRect(hw.blue);
    target.num_pos_act = 4;
    target.pos_act = [true,true,true,true];

    parent.matrix[ix][iy].setTextureRect(hw.pointRect(hw.white,hw.cell));
    var nteam = parent.gui_layer.turn;
    parent.gui_layer.updateTurn();
    
    nteam = (nteam+1)%nPlayers;
              
    while (parent.player[nteam].health <= 0 && nPlayers > 1)
    {
      parent.gui_layer.updateTurn();
      nteam = (nteam+1)%nPlayers;
    }

    var nx = Math.floor(parent.player[nteam].getPosition().x/32);
    var ny = Math.floor(parent.player[nteam].getPosition().y/32);
    parent.matrix[nx][ny].setTextureRect(hw.pointRect(hw.blue,hw.cell));

    target.state = "alone";
  }
};

hw.menu_functions = [hw.f1, hw.f2, hw.f3, hw.f4];

hw.create_menu = function(target)
{
  var base_node = target.getParent();
  var parent = base_node.getParent();
  var orig = target.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);

  
  var misarray = new Array();
  for (i = 0; i < hw.menu_functions.length; ++i)
  {
    if (target.pos_act[i])
    {
      var ab = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.actions[i]),new cc.Sprite(res.button_png, hw.actions[i]), hw.menu_functions[i](cmenu,target), base_node); 
      misarray.push(ab);
    }
  }

  var cmenu = new CircularMenu(misarray.length, 48);
  cmenu.addItems(misarray);

  cmenu.setPosition(ox*32,oy*32);
  base_node.addChild(cmenu,10,100);
  //TODO: Pause the node event listener
};
