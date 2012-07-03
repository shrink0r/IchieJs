/**
 * ##########################
 * #   Ichie - Main Def   #
 * ##########################
 */
var Ichie = function()
{
    this.stage = null;
    this.callbacks = null;
    this.layers = null;
};

Ichie.prototype.init = function(stage_container)
{
    this.layers = { main: new Kinetic.Layer({ id: 'layer-main' }) };
    this.stage = new Kinetic.Stage({
      container: stage_container,
      width: 500,
      height: 300
    });
};

Ichie.prototype.launch = function(src)
{
    var that = this;
    var image = new Image();
    image.onload = function()
    {
        var kinecticImage = that.createSrcImage(image);
        that.layers.main.add(kinecticImage);
        that.stage.add(that.layers.main);
        if (that.ready)
        {
            that.ready();
        }
    }
    image.src = src;
};

Ichie.prototype.createSrcImage = function(image)
{
    var width = image.naturalWidth;
    var height = image.naturalHeight;
    return kinecticImage = new Kinetic.Image({
        image: image,
        x: this.stage.getWidth() / 2 - (width / 2),
        y: this.stage.getHeight() / 2 - (height / 2),
        width: width,
        height: height,
        id: 'src-img'
    });
};

Ichie.prototype.enableCropMode = function()
{
    var select_rect = new Ichie.SelectionRect(this.stage, {
        'width': 150,
        'height': 100
    });
    select_rect.draw();
    this.layers.main.draw();
};

Ichie.prototype.constructor = Ichie;
