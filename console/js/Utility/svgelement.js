const elemType = {line:"line", node:"node",background:"background"};
class Elem {

    constructor(svg, tag,type = "node") {
        if(typeof(tag) === "string")
        {
            this.elem = document.createElementNS(svg.namespaceURI, tag);

        }
        else
        {
            this.elem = document.createElementNS(svg.namespaceURI, tag.tagName);
            for(let i = 0; i < tag.attributes.length; i++) {
                const e = tag.attributes[i].name;
                this.attr(e, tag.getAttribute(e));
            }
            console.log(tag.childNodes);
            for(let i = 0; i < tag.childNodes.length; i++)
            {
                new Elem(this.elem,tag.childNodes[i]);
            }

        }
        this.translates = [];
        switch(type)
        {
            case "node":
                svg.appendChild(this.elem);
                break;
            case "line":
                svg.insertBefore(this.elem, document.getElementById("lines"));
                break;
            case "background":
                svg.insertBefore(this.elem, document.getElementById("background"));
        }

    }
    removeElement()
    {
        this.elem.remove();
    }
    translate(x,y)
    {
        this.translates.push({x:x,y:y});

        const transformString = this.attr("transform") !== null? this.attr("transform") :  "";
        this.attr("transform",transformString+" translate("+x+","+y+")");

        Elem.center = add(Elem.center)({x:x,y:y,z:0});
        Elem.centerCount ++;
    }
    addClass(c)
    {
        this.elem.classList.add(c);
        return this;
    }
    removeClass(c)
    {
        this.elem.classList.remove(c);
        return this;
    }
    getTransform() { return  this.translates.reduce((i,a)=>({x:a.x+i.x,y:a.y+i.y}),{x:0,y:0})};
    hasCentre() {return this.attr('cx') !== undefined && this.attr('cy') !== undefined}
    getCenterPosition(){const trans = this.getTransform(); return {x:trans.x+Number(this.attr('cx')), y:trans.y+Number(this.attr('cy'))}}
    attr(name, value) {
        if (typeof value === 'undefined') {
            return this.elem.getAttribute(name);
        }
        this.elem.setAttribute(name, value);
        return this;
    }
    observeEvent(event) {
        return Observable.fromEvent(this.elem, event);
    }
}
Elem.center = {x:0,y:0,z:0};
Elem.centerCount = 0;
Elem.getCenter = () => {console.log(Elem.center);return divideNumber(Elem.center)(Elem.centerCount)};
//# sourceMappingURL=svgelement.js.map