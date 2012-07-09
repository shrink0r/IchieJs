/**
 * Create and intialize a new Ichie instance thereby passing in the html element id,
 * that we want IchieJs to use as it's container.
 * Then launch the ichie instance with an image url and make it show the selection rect on ready.
 */
(function(container, image_uri)
{
    var ichie = new Ichie();
    ichie.init(container);
    ichie.launch(image_uri);
    ichie.ready = function()
    {
        ichie.showSelection();
    };
})(
    $('.container-ichiejs').first()[0], 
    'images/vader2.jpg'
);