/**
 * Create and intialize a new Ichie instance thereby passing in the html element id,
 * that we want IchieJs to use as it's container.
 * Then launch the ichie instance with an image url 
 * and make it show the selection rect on ready.
 */
(function(exports, $)
{
    var ichie = exports.IchieJs.create(
        $('.container-ichiejs').first()[0]
    );
    ichie.launch('images/vader2.jpg', function()
    {
        ichie.showSelection();

        $('.trigger-copy').click(function()
        {
            ichie.copyCurrentSelection();
        });

        $('.trigger-paste').click(function()
        {
            ichie.pasteClipboard();
        });

        $('.trigger-undo').click(function()
        {
            ichie.undo();
        });

        $('.trigger-redo').click(function()
        {
            ichie.redo();
        });

        $('.trigger-crop').click(function()
        {
            ichie.crop();
        });

        $('.trigger-filter').click(function()
        {
            ichie.filter(
                $(this).data('filter-name')
            );
        });

        $('.trigger-keep-ratio').click(function()
        {
            console.log($(this).hasClass('active'));
            ichie.setSelectMode(
                $(this).hasClass('active') ? 'default' : 'ratio'
            );
        });
    });
})(typeof exports === 'object' && exports || this, jQuery);