class Elem {
    constructor(svg, tag,front=true) {
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
        (front) ? svg.appendChild(this.elem) : svg.insertBefore(this.elem, svg.childNodes[0]);

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
//# sourceMappingURL=svgelement.js.map