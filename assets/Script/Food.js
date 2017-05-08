cc.Class({
    extends: cc.Component,

    properties: {
        weight: 0
    },

    // use this for initialization
    onLoad: function () {
        this.init();
    },

    init: function(){      
        this.weight = cc.random0To1() * 20;
        this.node.width = this.weight;
        this.node.height = this.weight;
        
        this.node.setPosition(cc.randomMinus1To1()*Grobal.backWidth/2, cc.randomMinus1To1()*Grobal.backHeight/2);
        // console.log('init..', this.node.width, 'point:', this.node.getPosition());

        var circleCollider = this.getComponent(cc.CircleCollider);
        circleCollider.radius = this.weight;//碰撞组件的半径大小
    },

    setWidth: function(weight){
        this.weight = weight;
        this.node.width = this.weight;
        this.node.height = this.weight;
    },

    unuse: function () {
        
    },

    reuse: function () {
        this.init();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
