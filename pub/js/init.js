var ichie = new Ichie();
ichie.init('stage-container');
ichie.launch('images/vader2.jpg');
ichie.ready = function()
{
    ichie.enableCropMode();
};