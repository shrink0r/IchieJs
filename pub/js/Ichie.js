/**
 * ##########################
 * #   Ichie - Main Def   #
 * ##########################
 */
var Ichie = function()
{
    this.options = null;
    this.stage = null;
    this.layer = null;
    this.image = null;
    this.image_selection = null;
};

Ichie.prototype = {

    init: function(container, options)
    {
        this.options = $.extend({}, Ichie.DEFAULT_OPTIONS, options || {});
        this.image_selection = new Ichie.ImageAreaSelection();
        this.layer = new Kinetic.Layer({ id: 'image-layer' });
        this.stage = new Kinetic.Stage({
          container: container,
          width: this.options.width,
          height: this.options.height
        });

        this.stage.add(this.layer);
    },

    launch: function(src)
    {
        var that = this, image = new Image();
        image.onload = function()
        {
            that.image = that.createKineticImage(image);
            that.layer.add(that.image);
            that.layer.draw();
            that.image_selection.init(that, {
                width: that.options.width / 2,
                height: that.options.height / 2
            });
            if (that.ready) // @todo replace with proper event propagation
            {
                that.ready();
            }
        }
        image.src = src;
    },

    createKineticImage: function(image)
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
    },

    showSelection: function()
    {
        this.image_selection.show();
    },

    hideSelection: function()
    {
        this.image_selection.hide();
    },

    getStage: function()
    {
        return this.stage;
    },

    getLayer: function()
    {
        return this.layer;
    },

    getImage: function()
    {
        return this.image;
    }
};

Ichie.DEFAULT_OPTIONS = {
    width: 500,
    height: 300
};