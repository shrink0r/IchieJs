/*global ImageFilters: false, ImageAreaSelection:false*/
var MainDisplay = function()
{
    this.stage = null;
    this.layer = null;
    this.image = null;
    this.scale_x = null;
    this.scale_y = null;
    this.drag_bounds = null;
    this.original_bounds = null;
    this.natural_dim = null;

    this.zoom_handler = null;
    this.image_selection = null;
};

MainDisplay.prototype = {

    init: function(options)
    {
        this.options = $.extend({}, MainDisplay.DEFAULT_OPTIONS, options || {});
        this.options.container = $(this.options.container).first();
        this.natural_dim = { width: 0, height: 0 };

        this.stage = new Kinetic.Stage({
            width: this.options.width,
            height: this.options.height,
            container: this.options.container[0]
        });

        this.layer = new Kinetic.Layer({ id: 'image-layer' });
        this.image = new Kinetic.Image({ id: 'preview-image' });
        this.layer.add(this.image);
        this.stage.add(this.layer);

        this.image_selection = new ImageAreaSelection();
        this.image_selection.init(this, {
            stage: this.stage,
            width: options.select_width || this.stage.getWidth(),
            height: options.select_height || this.stage.getHeight()
        });

        this.zoom_handler = this.onImageZoomed.bind(this);
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

    setImageDragBounds: function(bounds)
    {
        this.drag_bounds = bounds;

        var x = bounds.left < 0 ? 0 : bounds.left,
            y = bounds.top < 0 ? 0 : bounds.top,
            width = bounds.right - bounds.left,
            height = bounds.bottom - bounds.top,
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight(),
            new_width = width > stg_width ? stg_width : width,
            new_height = height > stg_height ? stg_height : height;

        this.image_selection.setDragBounds({
            top: y,
            right: x + new_width,
            bottom: y + new_height,
            left: x
        });
    },

    manageZoomHandler: function()
    {
        if (1 < this.scale_x || 1 < this.scale_y)
        {
            $(this.stage.getDOM()).bind('mousewheel', this.zoom_handler);
        }
        else
        {
            $(this.stage.getDOM()).unbind('mousewheel', this.zoom_handler);
        }
    },

    onImageZoomed: function(event, delta, delta_x, delta_y)
    {
        delta_x = Math.ceil(delta_x);
        delta_y = Math.ceil(delta_y);  

        var x, y, 
            ratio = this.natural_dim.width / this.natural_dim.height,
            new_height = this.image.getHeight() + delta_y,
            new_width = new_height * ratio,
            min_height = this.original_bounds.bottom - this.original_bounds.top,
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight();

        if (this.image.getHeight() === min_height && 0 >= delta_y)
        {
            return false;
        }
        else if (new_height < min_height)
        {
            x = this.original_bounds.left;
            y = this.original_bounds.top;
            new_height = min_height;
            new_width = new_height * ratio;
        }
        else
        {
            x = (stg_width / 2) - (new_width / 2);
            y = (stg_height / 2) - (new_height / 2);
        }

        this.image.setX(x);
        this.image.setY(y);
        this.image.setHeight(new_height);
        this.image.setWidth(new_width);

        this.scale_x = this.natural_dim.width / new_width;
        this.scale_y = this.natural_dim.height / new_height;

        this.setImageDragBounds({ top: y, right: (x + new_width), bottom: (y + new_height), left: x });
        this.options.onViewportChanged(
            this.translateDimensions({ top: -y, right: (-x + stg_width), bottom: (-y + stg_height), left: -x })
        );

        this.layer.draw();
        return false;
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
        var prev_width = this.natural_dim.width,
            prev_height = this.natural_dim.height,
            adjusted = false;
        this.natural_dim = {
            width: image.naturalWidth,
            height: image.naturalHeight
        };

        this.image.setImage(image);

        if (prev_width !== this.natural_dim.width ||
            prev_height !== this.natural_dim.height)
        {
            this.adjustImageDimensions(image);
            adjusted = true;
        }

        var x = this.image.getX(),
            y = this.image.getY(),
            width = this.image.getWidth(),
            height = this.image.getHeight(),
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight();

        this.original_bounds = { top: y, right: (x + width), bottom: (y + height), left: x };
        this.setImageDragBounds($.extend({}, this.original_bounds));

        if (adjusted)
        {
            this.image_selection.setSelection({
                dim : { width : width, height: height },
                pos: { x: x, y: y }
            });
        }

        this.manageZoomHandler();
        this.options.onViewportChanged(
            this.translateDimensions({ top: -y, right: (-x + stg_width), bottom: (-y + stg_height), left: -x })
        );
        this.layer.draw();
    },

    getCurrentSelection: function()
    {
        var relative_to = this.image.getAbsolutePosition();
        return this.translateDimensions(
            this.image_selection.getSelection(relative_to)
        );
    },

    showSelection: function()
    {
        this.image_selection.show();
    },

    hideSelection: function()
    {
        this.image_selection.hide();
    },

    setSelectMode: function(name)
    {
        this.image_selection.setResizeMode(name);
    },

    getImageBoundry: function()
    {
        return this.drag_bounds;
    }
};


MainDisplay.DEFAULT_OPTIONS = {
    width: 400,
    height: 300,
    onzoomed: function() {}
};