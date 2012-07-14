/*global ImageFilters: false*/
var PreviewDisplay = function()
{
    this.stage = null;
    this.layer = null;
    this.image = null;
};

PreviewDisplay.prototype = {

    init: function(options)
    {
        this.options = $.extend({}, PreviewDisplay.DEFAULT_OPTIONS, options || {});
        this.options.container = $(this.options.container).first();
        this.stage = new Kinetic.Stage({
            width: this.options.width,
            height: this.options.height,
            container: this.options.container[0]
        });
        this.layer = new Kinetic.Layer({ id: 'image-layer' });
        this.image = new Kinetic.Image({ id: 'preview-image' });
        this.layer.add(this.image);
        this.stage.add(this.layer);
    },

    setImage: function(image, adopt_size)
    {
        var stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight(),
            ratio = image.naturalWidth / image.naturalHeight,
            width, height;

        if (1 < ratio)
        {
            height = image.naturalHeight > stg_height ? stg_height : image.naturalHeight;
            width = height * ratio;
        }
        else
        {
            width = image.naturalWidth > stg_width ? stg_width : image.naturalWidth;
            height = width / ratio;
        }
        this.image.setImage(image);
        this.image.setX(
            stg_width / 2 - (width / 2)
        );
        this.image.setY(
            stg_height / 2 - (height / 2)
        );
        this.image.setWidth(width);
        this.image.setHeight(height);
        this.layer.draw();
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
    },

    getDOM: function()
    {
        return this.stage.getDOM();
    }
};

PreviewDisplay.DEFAULT_OPTIONS = {
    width: 250,
    height: 150
};