import SPResourceElement from '/js/controls/resource.js';
import store from '/js/concepts/music/store.js';
export default class SPmusicResourceElement extends SPResourceElement {
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (!newVal) return;
        if (attrName === 'uri') {
            let state = null;
            if (newVal in window.storify.nodes) {
                state = window.storify.nodes[newVal];
                this.setState(state);
                debugger
            }
            state = await store.request('GET', newVal);
            this.setState(state);
        }
    }
    connectedCallback() {
        if (this.created1) {
            this.attributeChangedCallback('uri', null, this.getAttribute('uri'))
            this.created1 = true;
        }
    }
    vibrance() {
        let img = document.createElement('img');
        img.crossOrigin = '';
        img.src = this.object.images[0].url;
        img.onload = () => {

            var vibrant = new Vibrant(img);
            let color = vibrant.swatches()['Vibrant'];
            let light = vibrant.swatches()['LightVibrant'];
            let muted = vibrant.swatches()['Muted'];

            let bgColor = swatchToColor(color);

        //    this.view.style.backgroundColor = bgColor;
            let background = 'linear-gradient(-90deg, ' + swatchToColor(color) + ', ' + swatchToColor(muted) + ')';
            this.view.style.background = background;
        }
    }
    setState(obj) {
        this.obj = obj;
        this.innerHTML = '<sp-link uri="' + obj.uri + '">' + obj.name + '</sp-link>';
    }
}