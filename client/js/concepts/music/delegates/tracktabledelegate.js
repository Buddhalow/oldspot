import store from '/js/concepts/music/store.js'

import SPTableDelegate from '/js/controls/tabledelegate.js';

export default class SPTrackTableDelegate extends SPTableDelegate {
    onItemDblClick(tr) {
        let id = tr.getAttribute('data-uri');
    }
}
