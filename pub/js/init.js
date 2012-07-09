/**
 * Create and intialize a new Ichie instance thereby passing in the html element id,
 * that we want IchieJs to use as it's container.
 * Then launch the ichie instance with an image url and make it show the selection rect on ready.
 */
(function(exports, $)
{
    var ichie = exports.IchieJs.create(
        $('.container-ichiejs').first()[0]
    );
    ichie.launch('images/vader2.jpg', function()
    {
        console.log("asdas");
        ichie.showSelection();
    });
})(window, $);