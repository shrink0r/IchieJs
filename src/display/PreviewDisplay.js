/*global ImageFilters: false*/
var PreviewDisplay = function()
{
    this.stage = null;
    this.layer = null;
    this.image = null;
    this.scale_x = null;
    this.scale_y = null;
    this.original_dim = null;

    this.viewport_rect = null;
};

PreviewDisplay.prototype = {

    init: function(options)
    {
        this.options = $.extend({}, PreviewDisplay.DEFAULT_OPTIONS, options || {});
        this.options.container = $(this.options.container).first();
        this.original_dim = { width: 0, height: 0 };

        this.stage = new Kinetic.Stage({
            width: this.options.width,
            height: this.options.height,
            container: this.options.container[0]
        });

        this.layer = new Kinetic.Layer({ id: 'image-layer' });
        this.image = new Kinetic.Image({ id: 'preview-image' });

        this.viewport_rect = new Kinetic.Rect({
            id: 'viewport-rect',
            fill: "rgba(0, 0, 0, 0)",
            stroke: "black",
            strokeWidth: 0.5
        });
       
        this.layer.add(this.image);
        this.layer.add(this.viewport_rect);
        this.stage.add(this.layer);
    },

    /**
     * --------------------------------------------------------------------------
     * PRIVATE METHODS - CLASS INTERNAL USAGE ONLY!
     * --------------------------------------------------------------------------
     */

    adjustImageDimensions: function(image)
    {
        var width = image.naturalWidth,
            height = image.naturalHeight,
            ratio = width / height,
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight(),
            stg_ratio = stg_width / stg_height,
            new_width, new_height;
        // Take care of max size (stage size) limits

        if (stg_ratio <= ratio && stg_width < width)
        {
            new_width = stg_width;
            new_height = new_width / ratio;
        }
        else if (stg_ratio > ratio && stg_height < height)
        {
            new_height = stg_height;
            new_width = new_height * ratio;
        }
        else
        {
            new_width = width;
            new_height = height;
        }
        this.scale_x = width / new_width;
        this.scale_y = height / new_height;

        this.image.setHeight(new_height);
        this.image.setWidth(new_width);

        var x = (stg_width / 2) - (new_width / 2),
            y = (stg_height / 2) - (new_height / 2);

        this.image.setX(x);
        this.image.setY(y);
    },

    /**
     * --------------------------------------------------------------------------
     * PUBLIC METHODS - USE AS YOU LIKE
     * --------------------------------------------------------------------------
     */

    setImage: function(image)
    {
        var prev_width = this.original_dim.width,
            prev_height = this.original_dim.height;

        this.original_dim = {
            width: image.naturalWidth,
            height: image.naturalHeight
        };

        this.image.setImage(image);

        if (prev_width !== this.original_dim.width ||
            prev_height !== this.original_dim.height)
        {
            this.adjustImageDimensions(image);
        }

        this.layer.draw();
    },

    onViewPortChanged: function(viewport_dims)
    {
        var offset_pos = this.image.getAbsolutePosition();

        var x = (viewport_dims.left / this.scale_x) + offset_pos.x;
        var y = (viewport_dims.top / this.scale_y) + offset_pos.y;
        var width = (viewport_dims.right - viewport_dims.left )/ this.scale_x;
        var height = (viewport_dims.bottom - viewport_dims.top ) / this.scale_y;

        this.viewport_rect.setWidth(width);
        this.viewport_rect.setHeight(height);
        this.viewport_rect.setX(x);
        this.viewport_rect.setY(y);
        this.layer.draw();
    }
};

PreviewDisplay.DEFAULT_OPTIONS = {
    width: 250,
    height: 150
};