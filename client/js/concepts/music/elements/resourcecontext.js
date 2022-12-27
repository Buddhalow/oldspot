import SPTableElement from '/js/controls/table.js';
import SPResourceTableDesigner from '/js/concepts/music/designers/resourcetabledesigner.js';
import SPRestDataSource from '/js/concepts/bungalow/datasources/restdatasource.js';
import SPTrackTableDelegate from '/js/concepts/music/elements/tracktabledelegate.js';

export default class SPResourceContextElement extends SPTableElement {
    connectedCallback() {
        super.connectedCallback();
        this.columnheaders = ['name', 'owner'];
        this.created2 = true;
        this.setAttribute('showcolumnheaders', 'true');
        this.designer = new SPResourceTableDesigner();
        this.dataSource = new SPRestDataSource('', this.query, this.fields, this.maxRows);
        this.delegate = new SPTrackTableDelegate(this);
        this.delegate = new SPTrackTableDelegate();
        this.attributeChangedCallback('uri', null, this.getAttribute('uri'));
        this.attributeChangedCallback('fields', null, this.getAttribute('fields'));
    }
};
