/**
 * Created by skyler on 14-6-11.
 */

function SQuery(arg){
    this.elements=[];
    this.dom_string='';
    switch (typeof arg){
        case 'function':
            domReady(arg);
            break;
        case 'string':
            if (arg.indexOf('<')!=-1){
                this.dom_string=arg;    //创建元素
            }else{
                this.elements=getEle(arg);
            }
            break;
        case 'object':
            if (arg instanceof Array){
                this.elements=arg;
            }else{
                this.elements.push(arg);
            }
    }
}

SQuery.prototype.css=function(name, value){
    if (arguments.length==2){
        for (var i=0; i<this.elements.length; i++){
            this.elements[i].style[name]=value;
        }
    }else{
        if (typeof name== 'string'){
            return getStyle(this.elements[0],name);
        }else{
            for (var i=0 ; i<this.elements.length; i++){
                for (var j in name){
                    this.elements[i].style[j]=name[j];
                }
            }
        }
    }
    return this;
};

SQuery.prototype.attr=function(name,value){
    if (arguments.length==2){
        for (var i=0; i<this.elements.length; i++) {
            this.elements[i].setAttribute(name, value);
        }
    }else{
        if (typeof name== 'string'){
            return this.elements[0].getAttribute(name);
        }else{
            for (var i=0; i<this.elements.length; i++){
                for (var j in name){
                    this.elements[i].setAttribute(j,name[j]);
                }
            }
        }
    }
    return this;
};

//添加事件
(function(){
    var arr=['click','mouseover','mouseup','mousedown','mouemove','keydown','keyup','change','load','scroll','blur','focus','resize','contextmenu'];

    function add(name){
        SQuery.prototype[name]=function(fn){
            for (var i=0 ;i<this.elements.length; i++){
                addEvent(this.elements[i],name,fn)
            }
            return this;   //链式操作每次都返回当前对象;
        };
    }

    for (var i=0; i<arr.length; i++){
        add(arr[i]);
    }
})();

//hover、toggle、mouseenter、mouseleave
SQuery.prototype.hover=function(fnOver,fnOut){
    for (var i=0; i<this.elements.length; i++){
        fnOver && this.mouseenter(fnOver);
        fnOut && this.mouseleave(fnOut);
    }
};

SQuery.prototype.mouseenter=function(fn){
    for (var i=0; i<this.elements.length; i++){
        addEvent(this.elements[i],'mouseover',function(ev){
            var from= ev.fromElement || ev.relatedTarget;
            if (isChild(this,from))return;
            fn && fn.call(this,ev);    //不call的话，如果调用的时候用到this就会出错
        });
    }
};

SQuery.prototype.mouseleave=function(fn){
    for (var i=0; i<this.elements.length; i++){
        addEvent(this.elements[i],'mouseout',function(ev){
            var to= ev.toElement || ev.relatedTarget;
            if (isChild(this,to)) return;
            fn && fn.call(this,ev);
        })
    }
};

SQuery.prototype.toggle=function(){
    var _arg=arguments;
    for(var i=0; i<this.elements.length; i++){
        (function(count){
            addEvent(this.elements[i],'click',function(ev){
                var fn=_arg[count%_arg.length];
                fn.call(this,ev);
                count++;
            })
        })(0);
    }
};

SQuery.prototype.appendTo=function(str){
    var aParent= getEle(str);
    for (var i=0; i<aParent.length; i++){
        appendTo(aParent[i],this.dom_string);
    }
};

SQuery.prototype.remove=function(){
    for (var i=0; i<this.elements.length; i++){
        this.elements[i].parentNode && this.elements[i].parentNode.removeChild(this.elements[i]);
    }
};

SQuery.prototype.index=function(){
    var obj=this.elements[this.elements.length-1];
    var arr= obj.parentNode.children;
    for (var i=0; i<arr.length; i++){
        if (obj==arr[i]){
            return i;
        }
    }
};

SQuery.prototype.eq=function(n){
    return $(this.elements[n]);
};
SQuery.prototype.get=function(n){
    return this.elements[n]
};

SQuery.prototype.find=function(str){
    var arr= getEle(str, this.elements);
    return $(arr);
};

SQuery.prototype.removeClass=function(sClass){
    var re=new RegExp('\\b'+sClass+'\\b',g);
    for (var i=0; i<this.elements.length;i++){
        this.elements[i].className.replace(re,'').replace(/^\s|\s$/g,'').replace(/\s+/g,' ');
    }
};
SQuery.prototype.addClass=function(sClass){
    var re=new RegExp('\\b'+sClass+'\\b');
    if (this.elements[i].className.search(re)==-1){
        if(this.elements[i].className){
            this.elements[i].className+=' '+sClass;
        }else{
            this.elements[i].className=sClass;
        }
    }
};

SQuery.prototype.height=function(){
    var obj=this.elements[0];
    return obj.clientHeight-parseInt(getStyle(obj,'paddingTop'))-parseInt(getStyle(obj,'paddingBottom'));
};

SQuery.prototype.outerHeight=function(){
    return this.elements[0].offsetHeight;
};

SQuery.prototype.width=function(){
    var obj=this.elements[0];
    return obj.clientWidth-parseInt(getStyle(obj,'paddingLeft'))-parseInt(getStyle(obj,'paddingRight'));
};

SQuery.prototype.outerWidth=function(){
    return this.elements[0].offsetWidth;
};





function $(arg){
    return new SQuery(arg);
}

function domReady(fn){
    if (document.addEventListener){
        document.addEventListener('DOMContentLoaded',fn,false)
    }else{
        var oS=document.getElementById('skylerQuert');
        if (!oS){
            document.write('<script id="skylerQuery" defer><\/script>')
        }
        oS.attachEvent('onreadystatechange',function(){
            if (oS.readyState=='complete'){
                fn && fn();
                if (oS.parentNode){
                    oS.parentNode.removeChild(oS);
                }
            }
        });
    }
}

function appendTo(oParent, str){
    var oTemp=document.createElement('div');
    oTemp.innerHTML=str;
    while(oTemp.childNodes.length){
        oParent.appendChild(oTemp.childNodes[0]);
    }
}

function isChild(oParent, obj){
    while(obj){
        if (oParent==obj)return true;
        obj=obj.parentNode;
    }
    return false;
}

function addEvent(obj,sEv, fn){
    if (obj.addEventListener){
        obj.addEventListener(sEv,fn,false);
    }else{
        obj.attachEvent('on'+sEv,fn);
        fn.call(obj,event);
    }
}

function getByClass(oParent, sClass){
    if (oParent.getElementsByClassName){
        return oParent.getElementsByClassName(sClass);
    }else{
        var arr=[];
        var aEle=document.getElementsByTagName('*');
        var reg= new RegExp('\\b'+sClass+'\\b');
        for (var i=0; i<aEle.length;i++){
            if(reg.test(sClass)){
                arr.push(aEle[i]);
            }
        }
        return arr;
    }
}

function startMove(obj,json,time){
    var count=Math.floor(time/30);
    var start={};
    var dis={};
    for (var name in json){
        if (name=='opacity'){
            start[name]=Math.floor(parseFloat(getStyle(obj,name))*100);
        }else{
            start[name]=getStyle(obj,name);
        }
        dis[name]=json[name]-start[name];
        clearInterval(obj.timer);
        obj.timer=setInterval(function(){
            n++;
            var a=n/count;
            for (var name in json){
                if (name=='opacity'){
                    obj.style[name]=(start[name]+dis[name]*a)/100;
                    obj.style.filter='alpha(opacity:'+(start[name]+dis[name]*a)+')';
                }else{
                    obj.style[name]=(start[name]+dis[name]*a)+'px';
                }
            }
        },30)
    }
}

function getByStr(aParent, str){
    var aChild=[];
    for (var i=0; i<aParent.length; i++){
        switch (str.charAt(0)){
            case '#':    //ID
                var oEle=document.getElementById(str.substring(1));
                aChild.push(oEle);
                break;
            case '.':    //Class
                if(/\.\w+:[a-z]+(\(.+\))?/i.test(str)){          //.box:first   .box:eq(0)
                    var aStr=str.split(/\.|:|\(|\)/g);
                    var aEle=getByClass(aParent[i],aStr[1]);
                    switch (aStr[2]){
                        case 'first':
                            aChild.push(aEle[0]);
                            break;
                        case 'last':
                            aChild.push(aEle[aEle.length-1]);
                            break;
                        case 'odd':
                            for (var j=1; j<aEle.length; j+=2){
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'even':
                            for (var j=0; j<aEle.length; j+=2){
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'eq':
                            var n= parseInt(aStr[3]);
                            if (!isNaN(n) && n>=0 && n<aEle.length){
                                aChild.push(aEle[n]);
                            }
                            break;
                    }
                }else if(/\.\w+#\w+/i.test(str)){                     //.box#li1
                    var aStr=str.split(/\.|#/g);
                    var aEle=getByClass(aParent[i],aStr[1]);
                    for (var j=0; j<aEle.length;j++){
                        if (aEle[j].id==aStr[2]){
                            aChild.push(aEle[j]);
                        }
                    }
                }else if(/\.\w+\[\w+=.+\]/i.test(str)){               //.box[type=button]
                    //alert(1);
                    var aStr=str.split(/\.|\[|=|\]/g);
                    var aEle=getByClass(aParent[i],aStr[1]);
                    for (var j=0; j<aEle.length; j++){
                        if (aEle[j].getAttribute(aStr[2])==aStr[3]){
                            aChild.push(aEle[j]);
                        }
                    }
                }else if(/\.\w+\.\w+/i.test(str)){                       //.box.box2
                    var aStr=str.split('.');
                    var aEle=getByClass(aParent[i],aStr[1]);
                    var reg= new RegExp('\\b'+aStr[2]+'\\b');
                    for (var j=0; j<aEle.length; j++){
                        if (reg.test(aEle[j].className)){
                            aChild.push(aEle[j]);
                        }
                    }
                }else{
                    var aEle=getByClass(aParent[i],str.substring(1));
                    for (var j=0; j<aEle.length; j++){
                        aChild.push(aEle[j]);
                    }
                }

                break;
            default :   //tag等

                if(/[a-z0-9]+\.\w+/i.test(str)){                                //li.box
                    var aStr=str.split('.');
                    var aEle=aParent[i].getElementsByTagName(aStr[0]);
                    var reg= new RegExp('\\b'+aStr[1]+'\\b');
                    for (var j=0; j<aEle.length; j++){
                        if (reg.test(aEle[j].className)){
                            aChild.push(aEle[j]);
                        }
                    }
                }else if(/[a-z0-9]+#\w+/i.test(str)){                           //li#li1
                    var aStr=str.split('#');
                    var aEle=aParent[i].getElementsByTagName(aStr[0]);
                    for (var j=0; j<aEle.length;j++){
                        if (aEle[j].id==aStr[1]){
                            aChild.push(aEle[i]);
                        }
                    }
                }else if(/[a-z0-9]+\[\w+=.\]/i.test(str)){                      //input[type=button]
                    var aStr=str.split(/\[|=|\]/g);
                    var aEle=aParent[i].getElementsByTagName(aStr[0]);
                    for (var j=0; j<aEle.length;j++){
                        if(aEle[j].getAttribute(aStr[1])==aStr[2]){
                            aChild.push(aEle[j]);
                        }
                    }
                }else if(/[a-z0-9]+:[a-z]+(\(.+\))?]/i.test(str)){              //li:first ,li:eq(0)  伪类选择器
                    var aStr=str.split(/:|\(|\)/g);
                    var aEle=aParent[i].getElementsByTagName(aStr[0]);
                    switch (aStr[1]){
                        case 'first':
                            aChild.push(aEle[0]);
                            break;
                        case 'last':
                            aChild.push(aEle[aEle.length-1]);
                            break;
                        case 'odd':
                            for (var j=1; j<aEle.length; j+=2){
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'even':
                            for (var j=0; j<aEle.length; j+=2){
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'eq':
                            var n= parseInt(aStr[2]);
                            if (!isNaN(n) && n<aEle.length && n>=0){
                                aChild.push(aEle[n]);
                            }
                    }
                }else{
                    var aEle=aParent[i].getElementsByTagName(str);
                    for (var j=0; j<aEle.length; j++){
                        aChild.push(aEle[j]);
                    }
                    break;
                }

        }
    }
    return aChild;
}

function getEle(str, aParent){
    var arr= str.replace(/^\s+|\s+$/g, '').split(/\s+/);
    var aParent=aParent || [document];
    var aChild=[];
    for (var i=0 ;i<arr.length; i++){
        aChild=getByStr(aParent,arr[i]);
        aParent=aChild;
    }
    return aChild;
}

