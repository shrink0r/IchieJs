/*global ImageFilters: false*/

var PreviewDisplay = function()
{
    this.stage = null;
    this.layer = null;
    this.image = null;
    this.scale_x = null;
    this.scale_y = null;
    this.original_dim = null;

    this.orig_viewport_size = null;
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
            strokeWidth: 0.5,
            draggable: true
        });

        var that = this;
        this.viewport_rect.on('dragmove', function()
        {
            that.options.onViewportChanged(
                that.translateDimensions(
                    that.getRelativeViewportBounds()
                )
            );
        });

        $(this.stage.getDOM()).bind('mousewheel', this.onViewportZoomed.bind(this));
       
        this.layer.add(this.image);
        this.layer.add(this.viewport_rect);
        this.stage.add(this.layer);
    },

    /**
     * --------------------------------------------------------------------------
     * PRIVATE METHODS - CLASS INTERNAL USAGE ONLY!
     * --------------------------------------------------------------------------
     */

    onViewportZoomed: function(event, delta, delta_x, delta_y)
    {
        delta_x = -Math.ceil(delta_x);
        delta_y = -Math.ceil(delta_y);

        var x, y, 
            ratio = this.orig_viewport_size.width / this.orig_viewport_size.height,
            new_height = this.viewport_rect.getHeight() + delta_y,
            new_width = new_height * ratio,
            max_height = this.orig_viewport_size.height,
            min_height = 15,
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight();

        if (this.viewport_rect.getHeight() === max_height && 0 < delta_y || this.viewport_rect.getHeight() === min_height && 0 > delta_y)
        {
            return false;
        }
        else if (new_height >= max_height)
        {
            x = this.orig_viewport_size.x;
            y = this.orig_viewport_size.y;
            new_height = max_height;
            new_width = new_height * ratio;
        }
        else if(new_height <= min_height)
        {
            new_height = min_height;
            new_width = new_height * ratio;
            x = (stg_width / 2) - (new_width / 2);
            y = (stg_height / 2) - (new_height / 2);
        }
        else
        {
            x = (stg_width / 2) - (new_width / 2);
            y = (stg_height / 2) - (new_height / 2);
        }

        this.viewport_rect.setX(x);
        this.viewport_rect.setY(y);
        this.viewport_rect.setHeight(new_height);
        this.viewport_rect.setWidth(new_width);

        this.updateViewportDragBounds();

        this.layer.draw();

        this.options.onViewportChanged(
            this.translateDimensions(
                this.getRelativeViewportBounds()
            )
        );
        return false;
    },

    fitImageToStage: function(image)
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

    updateViewportDragBounds: function()
    {
        var drag_bounds = {},
            width = this.image.getWidth(),
            height = this.image.getHeight(),
            rect_width = this.viewport_rect.getWidth(),
            rect_height = this.viewport_rect.getHeight();

        if (width > rect_width)
        {
            drag_bounds.left = this.image.getX();
            drag_bounds.right = (this.image.getX() + width) - rect_width;
        }
        else
        {
            drag_bounds.left = this.viewport_rect.getX();
            drag_bounds.right = drag_bounds.left;
        }
        if (height > rect_height)
        {
            drag_bounds.top = this.image.getY();
            drag_bounds.bottom = (this.image.getY() + height) - rect_height;
        }
        else
        {
            drag_bounds.top = this.image.getY();
            drag_bounds.bottom = drag_bounds.top;
        }
        this.viewport_rect.setDragBounds(drag_bounds);
    },

    getRelativeViewportBounds: function()
    {
        var viewport_pos = this.viewport_rect.getAbsolutePosition(),
            relative_to = this.image.getAbsolutePosition(),
            x = viewport_pos.x - relative_to.x, 
            y = viewport_pos.y - relative_to.y;

        return {
            top: y,
            right: x + this.viewport_rect.getWidth(),
            bottom: y + this.viewport_rect.getHeight(),
            left: x
        };
    },

    translateDimensions: function(dimensions)
    {
        return {
            top: dimensions.top * this.scale_y,
            right: dimensions.right * this.scale_x,
            bottom: dimensions.bottom * this.scale_y,
            left: dimensions.left * this.scale_x
        };
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

        if (prev_width !== this.original_dim.width ||
            prev_height !== this.original_dim.height)
        {
            this.fitImageToStage(image);
        }

        this.image.setImage(image);
        this.updateViewportDragBounds();
        this.layer.draw();
    },

    onViewPortChanged: function(viewport_size)
    {
        var offset_pos = this.image.getAbsolutePosition();

        var x = (viewport_size.left / this.scale_x) + offset_pos.x;
        var y = (viewport_size.top / this.scale_y) + offset_pos.y;
        var width = (viewport_size.right - viewport_size.left )/ this.scale_x;
        var height = (viewport_size.bottom - viewport_size.top ) / this.scale_y;

        this.viewport_rect.setWidth(width);
        this.viewport_rect.setHeight(height);
        this.viewport_rect.setX(x);
        this.viewport_rect.setY(y);
        this.updateViewportDragBounds();
        this.layer.draw();

        if (! this.orig_viewport_size)
        {
            this.orig_viewport_size = {
                width: this.viewport_rect.getWidth(),
                height: this.viewport_rect.getHeight(),
                x: this.viewport_rect.getX(),
                y: this.viewport_rect.getY()
            };
        }
    }
};

PreviewDisplay.DEFAULT_OPTIONS = {
    width: 250,
    height: 150,
    onViewportChanged: function() {}
};