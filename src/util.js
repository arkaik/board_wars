// Opciones y configuración
var mat_size = 12; // Matriz n * n, n = mat_size
var nPlayers = 4; // Número de jugadores
var cPlayers = nPlayers; // Contador de jugadores restantes
var turn = 0;
var health4all = 5;

var texture = cc.textureCache.addImage(res.image_png);
var buttons = cc.textureCache.addImage(res.button_png);

var Plus = cc.Sprite.extend({
  state: "alone",
  health: health4all,
  defense: 2,
  team: 0,
  objective: null,
  compr: null,
  deselect: null,
  consequence: null,
  pos_act: null,
  num_pos_act: 4,
  ctor: function(string, rect)
  {
    this._super(string, rect);

    this.objective = hw.obj[hw.data];
    this.compr = hw.cmp[hw.data];
    this.deselect = hw.des[hw.data];
    this.consequence = hw.cns[hw.data];

    this.pos_act = [true,true,true,true];
    //var spr_defense = new cc.Sprite(texture);
    //sr_defense.setTextureRect(hw.silver);
    //this.addChild(spr_defense, 1, "mask");
  }
});

function Cell (string, px, py)
{
  cc.Sprite.call(this, string);
  this.inside = [];
  this.x = px;
  this.y = py;
}
Cell.prototype = Object.create(cc.Sprite.prototype);
Cell.prototype.constructor = Cell;

var CircularMenu = cc.Menu.extend({
  _nobj: 0,
  _radius: null,
  _angle: null,

  ctor: function( n, r){
    if (n <= 0) throw new Error("CircularMenu._ctor(n) : argument must be more or equal than 1.");
  
    this._radius = r;
    this._angle = [];
    
    //Ángulo entre cada objeto
    var alpha = 2*(Math.PI)/n;
    for (i = 0; i < n; i++)
    {
      this._angle.push(alpha*i);
    }

    this._super();

  },

  addItem: function(child, zOrder, tag)
  {
    if (this._nobj > this._angle.length)
      throw new Error("CircularMenu.addItem() : More than selected number of objects");
    else if (!(child instanceof cc.MenuItem))
      throw new Error("CircularMenu.addItem() : Not a cc.MenuItemSprite");

    var x = Math.cos(this._angle[this._nobj])*this._radius;
    var y = Math.sin(this._angle[this._nobj])*this._radius;
    child.setPosition(x,y);
    child.setAnchorPoint(0,0);
    this._nobj++;
    cc.Menu.prototype.addChild.call(this,child,zOrder,tag);
  },

  addItems: function()
  {
    if (arguments[0].constructor === Array)
    {
      for (i = 0; i < arguments[0].length; i++)
      {
        this.addItem(arguments[0][i]);
      }
    }
    else
    {
      for(i = 0; i < arguments.length; i++)
      {
        this.addItem(arguments[i]);
      }
    }
  }

});

var SelectionMenu = cc.Menu.extend({
  _opt: 0,
  _numSpr: null,
  _charSpr: null,
  _playerChar: null,
  ctor: function(){
    this._super();
    
    this._playerChar = new Array(4);
    for (k = 0; k < hw.buttons.length; k++)
    {
      this._playerChar[k] = k;
      var bm = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.buttons[k]), new cc.Sprite(res.button_png, hw.buttons[k]), this.numberFunc(this, k), this);
      bm.setPosition(32*k,64);
      
      this.addChild(bm);
    }

    this._charSpr = new Array(hw.symbol.length);
    for (i = 0; i < hw.symbol.length; i++)
    {
      var symspr = hw.pointRect(hw.symbol[i], hw.black);
      var symdis = hw.pointRect(hw.symbol[i], hw.dis);
      var menui = new cc.MenuItemSprite(new cc.Sprite(res.image_png, symspr), new cc.Sprite(res.image_png, symspr), new cc.Sprite(res.image_png, symdis), this.itemFunc(this,i), this);
      this._charSpr[i] = menui;
      menui.setPosition(32*i,0);
      this.addChild(menui);
    }

    

  },
  itemFunc: function(item, id){
    return function()
    {
      hw.data_sym[item._opt] = id;
      item._playerChar[item._opt] = id;
      item._charSpr[id].setEnabled(false);
    }
  },
  numberFunc: function(item, id)
  {
    item._opt = id;
  }
});


var backLayer = cc.Layer.extend(
{
  
  ctor: function()
  {
    this._super();
    this.init();
  },
  
  init: function()
  {
    this._super();
    
    var size = cc.director.getWinSize();
    var sprite = cc.Sprite.create(res.helloBG_png);
    sprite.setPosition(size.width / 2, size.height / 2);
    sprite.setScale(0.8);
    this.addChild(sprite);
  }
});

var guiLayer = cc.Layer.extend({
  turn: 0,
  labelTurn: null,
  labelHealth: null,
  ctor: function()
  {
    this._super();
    this.init();
  },
  
  init: function()
  {
    this._super();
    
    var size = cc.director.getWinSize();
    
    this.labelTurn = new cc.LabelTTF("Team: 0", "Helvetica", 20);
    this.labelTurn.setColor(cc.color(01,1,1));
    this.labelTurn.setPosition(size.width * 0.85, size.height * 0.75);
    this.addChild(this.labelTurn);
    
    this.labelHealth = new Array(nPlayers);
    for (z = 0; z < nPlayers; z++)
    {
      this.labelHealth[z] = new cc.LabelTTF("¦"+z+"¦ HP: "+health4all, "Helvetica", 20);
      this.labelHealth[z].setColor(cc.color(1,1,1));
      this.labelHealth[z].setPosition(size.width * 0.85, size.height*(0.70 - z*0.05));
      this.addChild(this.labelHealth[z]);
    }

  },
  
  updateTurn: function()
  {
    this.turn = (this.turn+1)%nPlayers;
    this.labelTurn.setString("Team: "+this.turn);
  },
  
  updateLH: function(i, h)
  {
    if (i < this.labelHealth.length) this.labelHealth[i].setString("¦"+i+"¦ HP: "+h);
    else cc.log("error in updateLH");
  }
  
});

var animLayer = cc.Layer.extend({
  gui_layer: null,
  base_node: null,
  matrix: null, // Matriz de celdas
  player: null, // Vector de jugadores
  cursor: null,
  ctor: function()
  {
    this.setName("animLayer");
    this._super();
    this.init();
  },
  
  init: function()
  {
    this._super();
    
    var winsize = cc.director.getWinSize();
    var centerPoint = cc.p(winsize.width / 2, winsize.height / 2);
    var start = cc.p(centerPoint.x-(12/2*32), centerPoint.y-(12/2*32));
    
    //Creamos un nodo base para que las distancias y los moviemientos se calculen con este punto como origen de coordenadas.
    this.base_node = new cc.Node();
    this.base_node.setPosition(start);
    this.addChild(this.base_node);

    // Tablero
    this.matrix = new Array(mat_size);
    for (i = 0; i < mat_size; i++)
    {
      this.matrix[i] = new Array(mat_size);
      for (j = 0; j < mat_size; j++)
      {
        
        this.matrix[i][j] = new Cell(texture, i, j);
        var rmat = hw.pointRect(hw.white,hw.cell);
        this.matrix[i][j].setTextureRect(rmat);
        this.matrix[i][j].setPosition(32*i+16, 32*j+16);
        this.matrix[i][j].setName("Cell["+i+"]["+j+"]");
        this.base_node.addChild(this.matrix[i][j]);
      } 
    }

    this.player = new Array(nPlayers);
    for (p = 0; p < this.player.length; p++)
    {
      var rpx = Math.floor(Math.random()*mat_size);
      var rpy = Math.floor(Math.random()*mat_size);
      var pchar = hw.data_sym[p];
      var rcell = hw.pointRect(hw.symbol[pchar], hw.black);
      this.player[p] = new Plus(texture, rcell);
      this.player[p].setPosition(32*rpx+16,32*rpy+16);
      this.player[p].setName("Player["+p+"]");
      this.base_node.addChild(this.player[p]);
      this.player[p].team = p;

      this.matrix[rpx][rpy].inside[p] = this.player[p];
    }
    
    this.cursor = new cc.Sprite(texture);
    this.cursor.setTextureRect(hw.dotted);
    this.cursor.setPosition(16,16);
    this.base_node.addChild(this.cursor);
    
    var i1x = Math.floor((this.player[0].getPosition().x)/32);
    var i1y = Math.floor((this.player[0].getPosition().y)/32);
    var cborder = hw.pointRect(hw.blue,hw.cell);
    this.matrix[i1x][i1y].setTextureRect(cborder);
  
    var list_act = cc.EventListener.create(
    {
      event: cc.EventListener.CUSTOM,
      eventName: "action",
      callback: function(event)
      {
        // Objetivo actual
        var target = event.getCurrentTarget();
        var base_node = target.getParent();
        var parent = base_node.getParent();
        var nteam = parent.gui_layer.turn;

        //Posición de origen
        var orig = target.getPosition();
        var ox = Math.floor(orig.x/32);
        var oy = Math.floor(orig.y/32);

        //Posición destino
        var pt = base_node.convertToNodeSpace(event.getUserData().location);
        var px = Math.floor(pt.x/32);
        var py = Math.floor(pt.y/32);

        var ok = cc.rectContainsPoint(target.getBoundingBox(), pt);
        var plz = nteam == target.team;
        // var alive = target.health > 0;
        
        if (ok && plz && target.state == "alone")
        {
          event.stopPropagation();
          //TO DO: Subclass of (Menu) and (MenuItem): CircularMenu, CircularMenuItem.
          hw.create_menu(target);
        }
        else if (target.state == "selected")
        { 
          if (target.compr(parent.matrix, px, py))
          {
            //parent.matrix[ox][oy].inside[target.team] = undefined;
            
            //Toda acción tiene su consecuencia... (hue hue)
            //*.consequence devuelve las celdas (points) que se atacan.
            var attCell = target.consequence(parent.matrix, px, py);
            var finish = false;

            for (k = 0; k < attCell.length && !finish; k++)
            {
              var ptx = attCell[k].x;
              var pty = attCell[k].y;
              var affected = null;
              cc.log("("+ptx+", "+pty+") ["+parent.matrix[ptx][pty].inside.length+"]");
              for (i = 0; i < parent.matrix[ptx][pty].inside.length && !finish ; i++)
              {
                affected = parent.matrix[ptx][pty].inside[i];
                cc.log("i = "+i);
                cc.log(affected);
                if (affected != undefined && affected.team != target.team)
                {
                  cc.log("Bingo "+affected.team);
                  affected.health -= 1;
                  parent.gui_layer.updateLH(affected.team, affected.health);
                  if (affected.health <= 0)
                  {
                    parent.matrix[px][py].inside[i] = undefined;
                    parent.removeChild(parent.player[i]);
                    --cPlayers;
                    if (cPlayers == 1)
                    {
                      cc.log("You win, gg ez");
                      parent.gui_layer.labelHealth[turn].setString("You win, gg ez");
                      finish = true;
                    }
                  }
                }
              }
            }
            
          }

          target.deselect(parent.matrix);
          //target.state = "alone";

          //hw.create_menu(target);
          
        }
        else if (target.state == "moving")
        {
          
          if (target.compr(parent.matrix, px, py))
          {

            var cx = px*32+16;
            var cy = py*32+16;
            //Devolver a su estado original las celdas rojas
            target.deselect(parent.matrix);
            
            var seqmov = cc.sequence(cc.moveTo(0.5, cx, cy), cc.callFunc(hw.create_menu,null,target));
            target.runAction(seqmov);
            
            cc.log(ox+", "+oy+" | "+px+", "+py);

            parent.matrix[ox][oy].inside[target.team] = undefined;
            parent.matrix[px][py].inside[target.team] = target;

            //target.setPosition(cx,cy);

            //hw.create_menu(target);
          }
          target.state = "alone";
        }

      }
    });
    
    var list_touch = cc.EventListener.create(
    {
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function(touch, event){
        return true;
      },
      onTouchEnded: function(touch, event)
      {
        var ev = new cc.EventCustom("action");
        var loc = touch.getLocation();
        ev.setUserData(
          {
            location: loc
          }
        );
        cc.eventManager.dispatchEvent(ev);
        return true;
      }
    });
  
    var list_key = cc.EventListener.create(
    {
        event: cc.EventListener.KEYBOARD,
        onKeyReleased: function (keyCode, event)
        {
          var cursor = event.getCurrentTarget();
          var base_node = cursor.getParent();
          var parent = base_node.getParent();
          var cpos = cursor.getPosition();
 
          if (keyCode == 37) //Izquierda
          {
            var newpos = cc.p(cpos.x-32,cpos.y);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
            {
              cursor.setPosition(cpos.x-32, cpos.y);
            }
          }
          if (keyCode == 38) //Arriba
          {
            var newpos = cc.p(cpos.x,cpos.y+32);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x, cpos.y+32);
          }
          if (keyCode == 39) //Derecha
          {
            var newpos = cc.p(cpos.x+32,cpos.y);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x+32, cpos.y);
          }
          if (keyCode == 40) //Abajo
          {
            var newpos = cc.p(cpos.x,cpos.y-32);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x, cpos.y-32);
          }
          if (keyCode == 32) //Espacio
          {
            var event = new cc.EventCustom("action");
            event.setUserData(
              {
                location: cpos
              }
            );
            cc.eventManager.dispatchEvent(event);
          }
          
        }
    });
   
    cc.eventManager.addListener(list_key, this.cursor);
    
    for (em = 0; em < this.player.length; em++)
    {
      cc.eventManager.addListener(list_touch.clone(), this.player[em]);
      cc.eventManager.addListener(list_act.clone(), this.player[em]);
    }
  }
});

var playScene = cc.Scene.extend({
  onEnter:function ()
  {
    this._super();

    var back = new cc.LayerColor(cc.color(192,192,192,255));
    var anim = new animLayer();
    var gui = new guiLayer();
    
    this.addChild(back);
    this.addChild(anim);
    this.addChild(gui);
    
    anim.gui_layer = gui;
  }
});

var menuLayer = cc.Layer.extend({
  opt: null,
  
  ctor: function()
  {
    this._super();
    this.init();
  },
  init: function()
  {
    this._super();

    var winsize = cc.director.getWinSize();
    var centerpos = cc.p(winsize.width / 2, winsize.height / 2);
    
    var colorLayer = new cc.LayerColor(cc.color(255,255,255,255));
    this.addChild(colorLayer);
    
    var spritebg = new cc.Sprite(res.helloBG_png);
    spritebg.setPosition(centerpos);
    this.addChild(spritebg);
    
    this.opt = new cc.EditBox(cc.size(130,40), cc.Scale9Sprite.create(res.greenbox_png));
    this.opt.setString("EditBox Sample");
    this.opt.setPosition(centerpos);
    this.opt.setFontColor(cc.color(255, 250, 0));
    this.opt.setDelegate(this);
    this.addChild(this.opt);
    

    var selmenu = new SelectionMenu();
    selmenu.setPosition(cc.p(winsize.width/3, winsize.height*0.65));
    this.addChild(selmenu);
    /*
    var b1 = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.buttons[0]), new cc.Sprite(res.button_png, hw.buttons[0]), function(){this.opt = 0;}, this);
    var b2 = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.buttons[1]), new cc.Sprite(res.button_png, hw.buttons[1]), function(){this.opt = 1;}, this);
    b2.setPosition(32,0);
    var b3 = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.buttons[2]), new cc.Sprite(res.button_png, hw.buttons[2]), function(){this.opt = 2;}, this);
    b3.setPosition(64,0);
    var b4 = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.buttons[3]), new cc.Sprite(res.button_png, hw.buttons[3]), function(){this.opt = 3;}, this);
    b4.setPosition(96,0);
    var menu_b = new cc.Menu(b1,b2,b3,b4);
    menu_b.setPosition(cc.p(winsize.width/3, winsize.height*0.75));
    this.addChild(menu_b);

    function ch(mic, i)
    {
      return function()
      {
        hw.data_sym[this.opt] = i;
        mic[i].setEnabled(false);
      }
    };

    var menu_c = new cc.Menu();
    menu_c.setPosition(cc.p(winsize.width/3, winsize.height*0.65))
    var mic = new Array(hw.symbol.length);
    for (i = 0; i < hw.symbol.length; i++)
    {
      var symspr = hw.pointRect(hw.symbol[i], hw.black);
      var symdis = hw.pointRect(hw.symbol[i], hw.dis);
      var menui = new cc.MenuItemSprite(new cc.Sprite(res.image_png, symspr), new cc.Sprite(res.image_png, symspr), new cc.Sprite(res.image_png, symdis), ch(mic, i), this);
      mic[i] = menui;
      menui.setPosition(32*i,0);
      menu_c.addChild(menui);
    }
    this.addChild(menu_c);*/
    
    cc.MenuItemFont.setFontSize(60);
    var button = new cc.MenuItemSprite(new cc.Sprite(res.greenbox_png),new cc.Sprite(res.greenbox_png), this.onPlay, this);
    var menu = new cc.Menu(button);
    menu.setPosition(cc.p(winsize.width/2, winsize.height*0.25));
    this.addChild(menu);
  },
  onPlay: function()
  {
    cc.director.runScene(new playScene());
  }
});

var menuScene = cc.Scene.extend({
  onEnter: function()
  {
    this._super();
    var layer = new menuLayer();
    this.addChild(layer);
  }
});
