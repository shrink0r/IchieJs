/**
 * ##########################
 * #   Ichie - Main Def   #
 * ##########################
 */
var Ichie = function(stage_container, options)
{
    options = options || {};
    this.options = options;
    this.options.width = options.width || 150;
    this.options.height = options.height || 150;

    this.stage = new Kinetic.Stage({
      container: stage_container,
      width: 500,
      height: 300
    });
    this.layer = new Kinetic.Layer({ id: 'image-layer' });
    this.stage.add(this.layer);
    
    this.image = null;
    this.select_rect = null;
};

Ichie.prototype.launch = function(src)
{
    var that = this,
        image = new Image();
    image.onload = function()
    {
        that.image = that.createKineticImage(image);
        that.layer.add(that.image);
        that.layer.draw();
        that.select_rect = that.createSelectRect();
        
        if (that.ready)
        {
            that.ready();
        }
    }
    image.src = src;
};

Ichie.prototype.createKineticImage = function(image)
{
    var width = image.naturalWidth,
        height = image.naturalHeight;
    return kinecticImage = new Kinetic.Image({
        image: image,
        x: this.stage.getWidth() / 2 - (width / 2),
        y: this.stage.getHeight() / 2 - (height / 2),
        width: width,
        height: height,
        id: 'src-img'
    });
};

Ichie.prototype.createSelectRect = function(image)
{
    return new Ichie.SelectionRect(this.stage, {
        'width': this.options.width,
        'height': this.options.height
    });
};

Ichie.prototype.showSelectionRect = function()
{
    this.select_rect.show();
};
