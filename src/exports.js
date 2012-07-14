/*global Ichie:false, exports:false*/

// -----------------------------------------------------------------------------
//                          EXPORTS SECTION
// In this section you'll find all the methods/properties, that we expose.
// -----------------------------------------------------------------------------

exports.IchieJs = {
    /**
     * @see IchieJs for supported options.
     */
    create: function(options) 
    {
        var exposed_methods = [ 
            'launch' , 'showSelection', 'hideSelection', 'setSelectMode', 'copySelection',
            'pasteClipboard', 'filter', 'crop', 'undo', 'redo', 'downloadAsImage'
        ];

        var ichie = new Ichie();
        ichie.init(options);

        var api = {};
        for (var i = 0; i < exposed_methods.length; i++)
        {
            var method_name = exposed_methods[i];
            api[method_name] = ichie[method_name].bind(ichie);
        }
        return api;
    }
};