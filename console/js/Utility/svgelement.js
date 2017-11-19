class Elem {
    constructor(svg, tag,back=true) {
        this.elem = document.createElementNS(svg.namespaceURI, tag);
        (back) ? svg.appendChild(this.elem) : svg.insertBefore(this.elem, svg.childNodes[0]);
    }
    removeElement()
    {
        this.elem.remove();
    }
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