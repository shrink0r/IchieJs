/**
 * ##########################
 * #   Ichie - Main Def   #
 * ##########################
 */
var Ichie = function(stage_container, options)
{
    this.options = $.extend(options || {}, Ichie.DEFAULT_OPTIONS);

    this.stage = new Kinetic.Stage({
      container: stage_container,
      width: this.options.width,
      height: this.options.height
    });
    this.layer = new Kinetic.Layer({ id: 'image-layer' });
    this.stage.add(this.layer);
    
    this.image = null;
    this.image_selection = null;
};

Ichie.prototype.launch = function(src)
{
    var that = this, image = new Image();
    image.onload = function()
    {
        that.image = that.createKineticImage(image);
        that.layer.add(that.image);
        that.layer.draw();
        that.image_selection = that.createImageAreaSelection();
        if (that.ready) // @todo replace with proper event propagation
        {
            that.ready();
        }
    }
    image.src = src;
};

Ichie.prototype.createKineticImage = function(image)
{
    var width = image.naturalWidth, height = image.naturalHeight;
    return kinecticImage = new Kinetic.Image({
        image: image,
        x: this.stage.getWidth() / 2 - (width / 2),
        y: this.stage.getHeight() / 2 - (height / 2),
        width: width,
        height: height,
        id: 'src-image'
    });
};

Ichie.prototype.createImageAreaSelection = function(image)
{
    return new Ichie.ImageAreaSelection(this, {
        width: this.options.width / 2,
        height: this.options.height / 2
    });
};

Ichie.prototype.showSelection = function()
{
    this.image_selection.show();
};

Ichie.prototype.hideSelection = function()
{
    this.image_selection.hide();
};

Ichie.prototype.getStage = function()
{
    return this.stage;
};

Ichie.prototype.getLayer = function()
{
    return this.layer;
};

Ichie.prototype.getImage = function()
{
    return this.image;
};

Ichie.DEFAULT_OPTIONS = {
    width: 500,
    height: 300
};