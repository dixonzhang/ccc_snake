cc.Class({
    extends: cc.Component,

    properties: {
        snakeName: null,
        snakeIndex: 0,
        isDead: false,
        speet: 0,
        prePointSnapshot: null,// 上一点的快照
        startPointSnapshot: null,// 当前点的快照
        distanceSnapshot: 0,     // 上一点与当前点快照的距离

        bodyOutColliderNode: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        // body用了两个碰撞组件， 外层的碰撞组件为了让机器蛇自动躲避其他蛇
        var bodyInCollider = this.getComponent(cc.CircleCollider);
        var bodyOutCollider = this.bodyOutColliderNode.getComponent(cc.CircleCollider);
        bodyOutCollider.radius = 3* bodyInCollider.radius;
    },
    init: function(name, index){
        this.snakeName = name;
        this.snakeIndex = index;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(!this.isDead){
            var speet = Grobal.snakeSpeetMap[this.snakeName];
            if(!speet){
                speet = this.speet;
                Grobal.snakeSpeetMap[this.snakeName] = speet;
            }

            // 将位置往上一个蛇身位置移动
            var snakeArray = Grobal.snakeMap[this.snakeName];
            if(snakeArray){



                if(!this.prePointSnapshot){//第一次为空时初始化                    
                    var prePoint = snakeArray[this.snakeIndex-1].getPosition();
                    this.prePointSnapshot = prePoint;
                    this.startPointSnapshot = this.node.getPosition();
                    this.distanceSnapshot = cc.pDistance(this.startPointSnapshot, this.prePointSnapshot);                    
                }

                // 累计移动的轨迹长度是否大于快照的长度是则重新初始化
                var totalDist = cc.pDistance(this.node.getPosition(), this.startPointSnapshot);
                // console.log('dist:', totalDist)
                if(totalDist >= this.distanceSnapshot - 0.1){
                    var prePoint = snakeArray[this.snakeIndex-1].getPosition();
                    this.prePointSnapshot = prePoint;
                    this.startPointSnapshot = this.node.getPosition();
                    this.distanceSnapshot = cc.pDistance(this.startPointSnapshot, this.prePointSnapshot);
                }


                // var subVec = cc.pSub(this.prePointSnapshot, this.node.getPosition());
                // var nomalVec = cc.pNormalize(subVec);
                var subVec = cc.pSub(this.prePointSnapshot, this.startPointSnapshot);

                this.node.x += subVec.x/speet * dt;
                this.node.y += subVec.y/speet * dt;
            }
        }
    },
});
