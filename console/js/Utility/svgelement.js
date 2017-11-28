class Elem {
    constructor(svg, tag,back=true) {
        this.translates = [];
        this.elem = document.createElementNS(svg.namespaceURI, tag);
        (back) ? svg.appendChild(this.elem) : svg.insertBefore(this.elem, svg.childNodes[0]);
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
    }
    getTransform() { return  this.translates.reduce((i,a)=>({x:a.x+i.x,y:a.y+i.y}),{x:0,y:0})};
    hasCentre() {return this.attr('cx') !== undefined && this.attr('cy') !== undefined}
    getCenterPosition(){const trans = this.getTransform(); return {x:trans.x + Number(this.attr('cx')), y:trans.y + Number(this.attr('cy'))}}
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
//# sourceMappingURL=svgelement.js.map