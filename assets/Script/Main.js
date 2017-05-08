cc.Class({
    extends: cc.Component,

    properties: {
        headPrefab: {
            default: null,
            type: cc.Prefab
        },
        bodyPrefab: {
            default: null,
            type: cc.Prefab
        },
        controlNode: {
            default: null,
            type: cc.Node
        },
        controlSprite: {
            default: null,
            type: cc.Node
        },
        speetNode: {
            default: null,
            type: cc.Node
        },
        cameraNode: {
            default: null,
            type: cc.Node
        },
        foodPrefab: {
            default: null,
            type: cc.Prefab
        },
        backNode: {
            default: null,
            type: cc.Node
        },
        controlCenterVec: null,
        speet: 0.12,
        speetUp: 0.06
    },

    // use this for initialization
    onLoad: function () {

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.controlMoveCallBack, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.controlEndCallBack, this);

        this.speetNode.on(cc.Node.EventType.TOUCH_START, this.speetStartCallBack, this);
        this.speetNode.on(cc.Node.EventType.TOUCH_END, this.speetEndCallBack, this);

        this.controlCenterVec = new cc.Vec2(this.controlNode.width/2, this.controlNode.height/2);

        Grobal.gameMain = this;
        Grobal.snakeMap = {};
        Grobal.snakeSpeetMap = {};
        Grobal.foodPool = new cc.NodePool('Food');//创建食物的对象池并指定脚本、这样会调用 unuse reuse方法
        Grobal.bodyPool = new cc.NodePool();
        Grobal.headPool = new cc.NodePool();
        Grobal.backWidth = this.backNode.width;
        Grobal.backHeight = this.backNode.height;

        //摄像机，跟随小蛇移动
        var camera = this.cameraNode.getComponent(cc.Camera);
       

        this.initFood(camera);

        for(var i = 0; i < 10; i++){
            this.createSnake('snake' + i, camera);
        }

        this.createSnake('player', camera);//可控制的小蛇
    },
    /**
     * 控制按钮
     */
    controlMoveCallBack: function(event){
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        var touchPoint = this.controlNode.convertToNodeSpace(touchLoc);

        // 设置控制点 限制超出父节点
        var subVec = cc.pSub(touchPoint, this.controlCenterVec);
        if(cc.pDistance(touchPoint, this.controlCenterVec) > this.controlNode.width/2){
            var nv = cc.pNormalize(subVec);
            this.controlSprite.x = this.controlCenterVec.x + nv.x * this.controlNode.width/2;
            this.controlSprite.y = this.controlCenterVec.y + nv.y * this.controlNode.width/2;
        }else{
            this.controlSprite.setPosition(touchPoint);
        }


        var playerSnakeArr = Grobal.snakeMap['player'];
        if(playerSnakeArr && playerSnakeArr[0]){
            var headScript = playerSnakeArr[0].getComponent('Head');
            if(headScript){
                headScript.setVec(subVec);
            }
        }
    },
    /**
     * 松开时回复控制点到中点
     */
    controlEndCallBack: function(event){
        // 恢复控制点位置控制点
        this.controlSprite.setPosition(this.controlCenterVec);
    },

    speetStartCallBack: function(){
        var speet = Grobal.snakeSpeetMap['player'];
        if(speet)
            Grobal.snakeSpeetMap['player'] = this.speetUp; 
    },
    speetEndCallBack: function(){
        var speet = Grobal.snakeSpeetMap['player'];
        if(speet)
            Grobal.snakeSpeetMap['player'] = this.speet; 
    },

    createSnake: function(name, camera){
        var x = 960/2 * cc.randomMinus1To1();
        var y = 640/2 * cc.randomMinus1To1();

        var snakeArr = new Array();

        // 蛇头
        var headPrefab = cc.instantiate(this.headPrefab);
        var headScript = headPrefab.getComponent('Head');
        headScript.init(name);
        headScript.setVec(new cc.Vec2(100*cc.randomMinus1To1(), 100*cc.randomMinus1To1()));

        snakeArr.push(headPrefab);

        //  蛇身
        for(var i = 0; i < 5; i++){
            var bodyPrefab = cc.instantiate(this.bodyPrefab);
            bodyPrefab.getComponent('Body').init(name, i+1);
            snakeArr.push(bodyPrefab);
        }

        for(var i = 0; i < snakeArr.length; i++){
            var bodyPrefab = snakeArr[i];

            this.node.addChild(bodyPrefab);
            bodyPrefab.setPosition(cc.p(i*bodyPrefab.width + x, 0 + y));

            camera.addTarget(bodyPrefab);
        }

        Grobal.snakeMap[name] = snakeArr;
    },
    initFood: function(camera){
        for(var i = 0; i < 100; i++){
            var food = cc.instantiate(this.foodPrefab);

            this.node.addChild(food);
            camera.addTarget(food);
        }
    },
    addFood: function(position, weight){
        var food;
        if(Grobal.foodPool.size()>0)
            food = Grobal.foodPool.get();
        else
            food = cc.instantiate(this.foodPrefab);

        this.node.addChild(food);
        food.setPosition(position);
        food.getComponent('Food').setWidth(weight);

        var camera = this.cameraNode.getComponent(cc.Camera);
        camera.addTarget(food);
    },
    addBody: function(body){
        this.node.addChild(body);
        var camera = this.cameraNode.getComponent(cc.Camera);
        camera.addTarget(body);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
        
    // },
    lateUpdate: function (dt) {
        
        if(Grobal.snakeMap['player']){
            // camera跟踪蛇头 关键代码！！！
            let targetPos = Grobal.snakeMap['player'][0].convertToWorldSpaceAR(cc.Vec2.ZERO);
            this.cameraNode.position = this.cameraNode.parent.convertToNodeSpaceAR(targetPos);
            
            // let ratio = targetPos.y / cc.winSize.height;
            // this.camera.zoomRatio = 1 + (0.5 - ratio) * 0.5;
        }
    },
});
