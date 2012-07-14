/**
 * Create and intialize a new Ichie instance thereby passing in the html element id,
 * that we want IchieJs to use as it's container.
 * Then launch the ichie instance with an image url 
 * and make it show the selection rect on ready.
 */
(function(exports, $)
{
    var ichie = exports.IchieJs.create({
        main_container: '.ichiejs-main-stage',
        preview_container: '.ichiejs-preview-stage',
        width: 550,
        height: 350
    });

    ichie.launch('images/Kitten_Desktop.jpg', function()
    {
        ichie.showSelection();

        $('.trigger-copy').click(function()
        {
            ichie.copySelection();
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

        $('.trigger-download').click(function()
        {
            ichie.downloadAsImage();
        });

        $('.trigger-resize').click(function()
        {
            $('#resize-modal').modal('show');
        });

        $('.trigger-filter').click(function()
        {
            ichie.filter(
                $(this).data('filter-name')
            );
        });

        $('.trigger-keep-ratio').click(function()
        {
            ichie.setSelectMode(
                $(this).hasClass('active') ? 'default' : 'keep-ratio'
            );
        });
    });
})(typeof exports === 'object' && exports || this, jQuery);