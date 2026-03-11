"use strict";
// src/app/ui/widgets/text-box.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextBox = createTextBox;
function createTextBox(props) {
    var root = document.createElement('section');
    root.className = 'textbox';
    if (props.title) {
        var titleWrap = document.createElement('section');
        titleWrap.className = 'textbox-title';
        var titleText = document.createElement('p');
        titleText.className = 'textbox-title-text';
        titleText.textContent = props.title;
        titleWrap.appendChild(titleText);
        root.appendChild(titleWrap);
    }
    var contentWrap = document.createElement('section');
    contentWrap.className = 'textbox-contents';
    for (var _i = 0, _a = props.lines; _i < _a.length; _i++) {
        var line = _a[_i];
        var lineEl = document.createElement('p');
        lineEl.textContent = line;
        contentWrap.appendChild(lineEl);
    }
    root.appendChild(contentWrap);
    return root;
}
var mount = document.querySelector('main');
if (mount) {
    mount.appendChild(createTextBox({
        title: 'Player',
        lines: ['HP: 24/24', 'Energy: 2/6'],
        variant: 'cutout',
    }));
}
