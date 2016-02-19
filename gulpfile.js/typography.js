var posthtml = require('posthtml');
var richtypo = require('richtypo');

var Hypher = require('hypher');
var hyphers = {
    'en': new Hypher(require('hyphenation.en-us')),
    'ru': new Hypher(require('hyphenation.ru'))
};

module.exports = function(text, lang) {
    var result = text;
    // Hyphenate HTML
    result = posthtml()
        .use( function(tree) {
            tree.walk(function(node) {
                textNode = node
                if (typeof(textNode) == 'string') {
                    textNode = hyphers[lang].hyphenateText(textNode);
                }
                return textNode
                });
            return tree
        })
        .process(result, { sync: true }).html

    // Removing the last soft hyphen when the result is short
    result = result.replace(new RegExp('\u00AD([a-zа-я]{1,4}[\.\,\:\?\!\…]?\s*</(?:p|h2|h3|h4)>)', 'gi'),'$1')

    // Typography
    result = richtypo.rich(result, lang)

    // TODO: Make other abbreviations too, like JS, W3C etc.

    // Mark the starting abbrs
    result = result.replace(new RegExp('(<(?:p|li)>|[\.\?\!\…](?:[  ]|&nbsp;))<abbr>([A-ZА-Я]+</abbr>)', 'g'),'$1<abbr class="starting">$2')

    // Replace soft hyphens with special spans
    result = result.replace(new RegExp('\u00AD', 'g'), '<span class="shy"></span>')

    return result;
};