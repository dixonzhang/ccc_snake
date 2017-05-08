cc.Class({
    extends: cc.Component,

    properties: {
        bodyPrefab: {
            default: null,
            type: cc.Prefab
        },
        canControl: false,
        snakeName: null,
        vec: null,
        isDead: false,
        speet: 0,
        growingWeight: 0, // 增长的体重满10则增加一个节点
    },

    // use this for initialization
    onLoad: function () {
        //碰撞检测
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDrawBoundingBox = true;
    },
    init: function(name){
        this.snakeName = name;
    },
    setVec: function(vec){
        this.vec = vec;
    },

    setCanControl: function(canControl){
        this.canControl = canControl;
    },

       //碰撞事件监听
    onCollisionEnter: function (other) {
        var group = cc.game.groupList[other.node.groupIndex];

        if(group === 'food'){
            var foodScript = other.node.getComponent('Food');
            this.growingWeight += foodScript.weight;
            
            Grobal.foodPool.put(other.node);
            if(this.growingWeight/10 > 0){
                var size = this.growingWeight / 10;
                for(var i = 0; i < Math.floor(size); i++){
                    var body = cc.instantiate(this.bodyPrefab);//生成身体
                    
                    //根据最后两个节点的向量的确定新增节点的坐标
                    var arr = Grobal.snakeMap[this.snakeName];
                    var lastp = arr[arr.length-1].getPosition();
                    var lastp2 = arr[arr.length-2].getPosition();

                    body.getComponent('Body').init(this.snakeName, arr.length);

                    var subVec = cc.pSub(lastp, lastp2);
                

                    var currp = cc.pAdd(lastp, subVec);

                    body.setPosition(currp);
                    Grobal.gameMain.addBody(body);

                    arr.push(body);
                }

                this.growingWeight = this.growingWeight % 10;//增加节点后，修改重量为余数
            }
        }
        if(group === 'body out'){//遇到其他蛇则躲闪
            // 是自己则不处理
            var bodyScript = other.node.parent.getComponent('Body');
            if(bodyScript){
                if(this.snakeName == bodyScript.snakeName)
                    return;
            }

            var arr = Grobal.snakeMap[this.snakeName];
            if(arr){
                var p1 = arr[0].getPosition();
                var p2 = arr[1].getPosition();

                var subVec = cc.pSub(p1, p2);
                // var prepVec = cc.pPerp(subVec);//逆时针90度

                var x = -subVec.x;
                var y = cc.randomMinus1To1()*subVec.y;

                var v = cc.v2(x, y);
                this.vec = v;
            }
        }
        if(group === 'body'){
            // 是自己则不处理
            var bodyScript = other.node.getComponent('Body');
            if(bodyScript){
                if(this.snakeName == bodyScript.snakeName)
                    return;
            }

            this.isDead = true;
            
            var arr = Grobal.snakeMap[this.snakeName];
            if(arr){
                for(var i = 0; i < arr.length; i++){
                    var prefab = arr[i];
                    var bodyScript = prefab.getComponent('Body');
                    if(bodyScript){
                        bodyScript.isDead = true;
                    }

                    //死蛇变成食物
                    Grobal.gameMain.addFood(prefab.getPosition(), 10);
                    
                    //回收蛇
                    if(i == 0)
                        Grobal.headPool.put(prefab);
                    else
                        Grobal.bodyPool.put(prefab);
                }
                Grobal.snakeMap[this.snakeName] = null;
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!this.isDead){
            var speet = Grobal.snakeSpeetMap[this.snakeName];
            if(!speet){
                speet = this.speet;
                Grobal.snakeSpeetMap[this.snakeName] = speet;
            }

            var vvv = cc.pNormalize(this.vec);

            // console.log(vvv.x, ',', vvv.y);
            this.node.x += vvv.x*this.node.width/speet *dt;
            this.node.y += vvv.y*this.node.width/speet *dt;

            if(Math.abs(this.node.x) >= Grobal.backWidth/2){
                this.vec.x = -this.vec.x;
            }
            if(Math.abs(this.node.y) >= Grobal.backHeight/2){
                this.vec.y = - this.vec.y;
            }
        }
    },
});
