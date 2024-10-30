/**
 * This plugin provides a button named 'codeButton' which users can use to wrap text
 * in a <code>code element</code> or tag.
 * 
 * Thanks to Raphael Barbate (potsky) for this tinyMce plugin
 */
(function () {

    tinymce.create('tinymce.plugins.codeButtonPlugin', {
        init: function (ed, url) {

            // Register commands
            ed.addCommand('mceCodeButton', function () {
                ed.execCommand('mceBeginUndoLevel');

                var e = ed.dom.getParent(ed.selection.getNode(), 'CODE');
                if (e === null) {
                    //add code element
                    if (ed.selection.isCollapsed()) {
                        ed.execCommand('mceInsertContent', false, " <code>code</code>&nbsp;");
                    } else {
                        ed.execCommand('mceReplaceContent', false, ' <code>{$selection}</code>');
                    }
                } else {
                    //remove code element
                    ed.execCommand('mceRemoveNode', false, e);
                    ed.nodeChanged();
                }

                ed.execCommand('mceEndUndoLevel');
            });

            // Register buttons
            ed.addButton('codeButton', {
                title: 'Insert/edit code',
                cmd: 'mceCodeButton',
                icon: 'code'
            });

            //set button to pressed when cursor at code
            ed.onNodeChange.add(function (ed, cm, n) {
                cm.setActive('codeButton', n.nodeName == 'CODE');
            });
        },

        getInfo: function () {
            return {
                longname: 'Code Button',
                author: 'Mauro Bieg',
                authorurl: '',
                infourl: '',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('codeButton', tinymce.plugins.codeButtonPlugin);
})();









