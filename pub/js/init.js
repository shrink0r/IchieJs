var ichie = new Ichie('stage-container');
ichie.launch('images/vader2.jpg');
ichie.ready = function()
{
    ichie.showSelectionRect();
};