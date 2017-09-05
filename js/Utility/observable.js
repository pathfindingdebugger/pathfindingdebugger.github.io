class SafeObserver {
    constructor(destination) {
        this.isUnsubscribed = false;
        this.destination = destination;
        if (destination.unsub) {
            this.unsub = destination.unsub;
        }
    }
    next(value) {
        return this.destination.next(value);
    }
    complete() {
        this.destination.complete();
        this.unsubscribe();
    }
    unsubscribe() {
        this.destination.next = () => null;
        (this.unsub) ? this.unsub() : null;
    }
}
class Observable {
    constructor(_subscribe) {
        this._subscribe = _subscribe;
    }
    subscribe(next, complete) {
        const safeObserver = new SafeObserver({
            next: next,
            complete: complete ? complete : () => console.log('complete')
        });
        safeObserver.unsub = this._subscribe(safeObserver);
        return safeObserver.unsubscribe.bind(safeObserver);
    }
    static fromEvent(el, name) {
        return new Observable((observer) => {
            const listener = (e) => { /*e.stopPropagation();*/ observer.next(e); };
            el.addEventListener(name, listener);
            return () => { };
        });
    }
    static fromArray(arr) {
        return new Observable((observer) => {
            arr.forEach(el => observer.next(el));
            return () => { };
        });
    }
    static interval(milliseconds) {
        let time = 0;
        return new Observable((observer) => {
            const timer = setInterval(() => {
                observer.next(time + milliseconds);
                time += milliseconds;
            }, milliseconds);
            return () => clearInterval(timer);
        });
    }
    map(project) {
        return new Observable((observer) => {
            return this.subscribe(v => observer.next(project(v)), () => observer.complete());
        });
    }
    forEach(f) {
        return new Observable((observer) => {
            return this.subscribe(v => { f(v); return observer.next(v); }, () => observer.complete());
        });
    }
    filter(condition) {
        return new Observable((observer) => {
            return this.subscribe(v => condition(v) ? observer.next(v) : null, () => observer.complete());
        });
    }
    takeUntil(o) {
        return new Observable((observer) => {
            let fired = false;
            o.subscribe(() => fired = true);
            return this.subscribe(v => fired ? observer.complete() : observer.next(v), () => observer.complete());
        });
    }
    flatMap(streamCreator) {
        return new Observable((observer) => {
            return this.subscribe(v => streamCreator(v).subscribe((i) => { observer.next(i); }, () => { }), () => observer.complete());
        });
    }
    scan(initialVal, fun) {
        return new Observable((observer) => {
            let accumulator = initialVal;
            return this.subscribe(v => {
                accumulator = fun(accumulator, v);
                observer.next(accumulator);
            }, () => observer.complete());
        });
    }
}
//# sourceMappingURL=observable.js.map