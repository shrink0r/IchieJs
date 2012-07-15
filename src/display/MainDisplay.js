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
        this.image = new Kinetic.Image({ id: 'preview-image', draggable: true });
        this.layer.add(this.image);
        this.stage.add(this.layer);

        var that = this;
        this.image_selection = new ImageAreaSelection();
        this.image_selection.init(this, {
            stage: this.stage,
            width: options.select_width || this.stage.getWidth(),
            height: options.select_height || this.stage.getHeight(),
            onSelectionChanged: function()
            {
                that.options.onSelectionChanged(
                    that.getCurrentSelection()
                );
            }
        });

        this.zoom_handler = this.onImageZoomed.bind(this);
        this.image.on('dragmove', function()
        {
            that.options.onViewportChanged(
                that.translateDimensions({ 
                    top: -that.image.getY(), 
                    right: (-that.image.getX() + that.stage.getWidth()), 
                    bottom: (-that.image.getY() + that.stage.getHeight()), 
                    left: -that.image.getX()
                })
            );

            that.options.onSelectionChanged(
                that.getCurrentSelection()
            );
        });
    },

    /**
     * --------------------------------------------------------------------------
     * PRIVATE METHODS - CLASS INTERNAL USAGE ONLY!
     * --------------------------------------------------------------------------
     */

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

        return { top: y, right: (x + new_width), bottom: (y + new_height), left: x };
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
        this.updateViewportDragBounds();

        this.layer.draw();

        this.options.onViewportChanged(
            this.translateDimensions({ top: -y, right: (-x + stg_width), bottom: (-y + stg_height), left: -x })
        );
        this.options.onSelectionChanged(
            this.getCurrentSelection()
        );
        return false;
    },

    updateViewportDragBounds: function()
    {
        var drag_bounds = {},
            width = this.image.getWidth(),
            height = this.image.getHeight(),
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight();

        if (width > stg_width)
        {
            drag_bounds.left = stg_width - width;
            drag_bounds.right = 0;
        }
        else
        {
            drag_bounds.left = this.image.getX();
            drag_bounds.right = drag_bounds.left;
        }
        if (height > stg_height)
        {
            drag_bounds.top = stg_height - height;
            drag_bounds.bottom = 0;
        }
        else
        {
            drag_bounds.top = this.image.getY();
            drag_bounds.bottom = drag_bounds.top;
        }
        this.image.setDragBounds(drag_bounds);
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
            prev_height = this.natural_dim.height;

        this.natural_dim = {
            width: image.naturalWidth,
            height: image.naturalHeight
        };

        this.image.setImage(image);

        if (prev_width !== this.natural_dim.width ||
            prev_height !== this.natural_dim.height)
        {
            this.original_bounds = this.fitImageToStage(image);

            var x = this.image.getX(),
                y = this.image.getY(),
                width = this.image.getWidth(),
                height = this.image.getHeight(),
                stg_width = this.stage.getWidth(),
                stg_height = this.stage.getHeight();

            this.setImageDragBounds($.extend({}, this.original_bounds));
            this.image_selection.setSelection({
                dim : { width : width, height: height },
                pos: { x: x, y: y }
            });

            this.updateViewportDragBounds();

            this.options.onViewportChanged(
                this.translateDimensions({ top: -y, right: (-x + stg_width), bottom: (-y + stg_height), left: -x })
            );

            this.manageZoomHandler();
        }
        
        this.layer.draw();
    },

    onViewportChanged: function(viewport_size)
    {
        var offset_pos = this.image.getAbsolutePosition();

        var width = (viewport_size.right - viewport_size.left )/ this.scale_x;
        var height = (viewport_size.bottom - viewport_size.top ) / this.scale_y;
        var ratio = this.natural_dim.width / this.natural_dim.height;
        var zoom_y = this.stage.getHeight() / height;
        var zoom_x = this.stage.getWidth() / width;
        var image_height = (this.natural_dim.height / this.scale_y) * zoom_y;
        var image_width = image_height * ratio;
        var x = -(viewport_size.left / this.scale_x) * zoom_x;
        var y = -(viewport_size.top / this.scale_y) * zoom_y;

        this.image.setHeight(image_height);
        this.image.setWidth(image_width);
        this.image.setX(x);
        this.image.setY(y);

        this.scale_x = this.natural_dim.width / image_width;
        this.scale_y = this.natural_dim.height / image_height;

        this.setImageDragBounds({ top: y, right: (x + image_width), bottom: (y + image_height), left: x });
        this.updateViewportDragBounds();

        this.layer.draw();

        this.options.onSelectionChanged(
            this.getCurrentSelection()
        );
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
    onViewportChanged: function() {},
    onSelectionChanged: function() {}
};